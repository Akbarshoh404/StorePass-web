import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { CheckIcon, XIcon } from "./Icons";
import { StarInput } from "./StarRating";
import { formatMoney } from "../utils/format";

export default function ScanSheet({ onClose, onClaimed }) {
  const { user, revalidate } = useAuth();
  const toast = useToast();
  const scannerRef = useRef(null);
  const claimedRef = useRef(false);
  const [status, setStatus] = useState("Point your camera at the QR code");
  const [statusType, setStatusType] = useState("");
  const [result, setResult] = useState(null);
  const [manualToken, setManualToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    // The session cookie is shared per-browser: logging into a second account
    // in this browser (e.g. testing shop + customer on one laptop) silently
    // swaps the identity behind any tab still open on the first. Catch that
    // before even starting the camera, rather than letting the claim 403.
    let cancelled = false;
    revalidate().then((current) => {
      if (!cancelled && current && current.role !== "customer") {
        toast.error("This browser is signed in as something other than a customer right now.");
        onClose();
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 230 },
        (decodedText) => {
          if (!cancelled) handleDecoded(decodedText);
        },
        () => {}
      )
      .catch(() => {
        if (!cancelled) {
          setStatusType("error");
          setStatus("Could not access the camera. Enter the code manually below instead.");
        }
      });

    return () => {
      cancelled = true;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
    } catch {
      // scanner was already stopped/torn down — nothing to clean up
    }
  }

  async function handleDecoded(token) {
    if (claimedRef.current) return;
    claimedRef.current = true;
    await stopScanner();
    await claim(token);
  }

  async function claim(token) {
    setBusy(true);
    setStatusType("");
    try {
      const res = await api.claimTransaction(token);
      setResult(res);
      toast.success(`You earned ${formatMoney(res.cashback_amount)} at ${res.shop_name}!`);
      await onClaimed();
    } catch (err) {
      claimedRef.current = false;
      let message = err instanceof ApiError ? err.message : "Could not claim cashback";

      if (err instanceof ApiError && err.status === 403) {
        message = "This session belongs to a different account now. Sign in again as a customer to claim.";
        const current = await revalidate();
        if (!current || current.role !== "customer") {
          toast.error(message);
          onClose();
          return;
        }
      }

      setStatusType("error");
      setStatus(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualToken.trim() || busy) return;
    handleDecoded(manualToken.trim());
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!rating) return;
    setReviewSubmitting(true);
    try {
      await api.createReview({
        transaction_id: result.transaction_id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks for the review!");
      setReviewSubmitted(true);
      // onClaimed also covers "something about this shop changed" — the
      // review list and average rating need refreshing too, not just the
      // wallet balance from the claim itself.
      await onClaimed();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit review");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (user && user.role !== "customer") return null;

  return (
    <div className="scan-sheet-backdrop" onClick={result && !reviewSubmitted ? undefined : onClose}>
      <div className="scan-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <div className="sheet-header">
          <h2 className="text-title3">
            {reviewSubmitted ? "All set" : result ? "Rate your visit" : "Scan QR code"}
          </h2>
          {(!result || reviewSubmitted) && (
            <button className="btn btn-icon" onClick={onClose} aria-label="Close">
              <XIcon />
            </button>
          )}
        </div>

        {reviewSubmitted ? (
          <div className="result-burst">
            <div className="check">
              <CheckIcon />
            </div>
            <p className="text-title2">Thanks for the feedback</p>
            <p className="text-subhead text-secondary">It helps other customers pick where to shop</p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : result ? (
          <div className="review-prompt">
            <div className="result-burst compact">
              <div className="check">
                <CheckIcon />
              </div>
              <p className="text-title2">+{formatMoney(result.cashback_amount)}</p>
              <p className="text-subhead text-secondary">at {result.shop_name}</p>
            </div>

            <form className="stack" onSubmit={handleReviewSubmit}>
              <div className="field" style={{ alignItems: "center" }}>
                <label>How was it?</label>
                <StarInput value={rating} onChange={setRating} />
              </div>
              <div className="field">
                <label htmlFor="review-comment">Add a comment (optional)</label>
                <textarea
                  id="review-comment"
                  rows={3}
                  placeholder="What stood out?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!rating || reviewSubmitting}>
                {reviewSubmitting ? <span className="spinner" /> : "Submit review"}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div id="qr-reader" />
            <p className={`scan-status ${statusType}`}>{status}</p>

            <form className="stack" style={{ marginTop: 16 }} onSubmit={handleManualSubmit}>
              <div className="field">
                <label htmlFor="manual-token">Or enter the code manually</label>
                <input
                  id="manual-token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="QR token"
                />
              </div>
              <button type="submit" className="btn btn-fill btn-block" disabled={busy}>
                {busy ? <span className="spinner" /> : "Claim"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
