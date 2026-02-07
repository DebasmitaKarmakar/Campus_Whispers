import { submitFeedback } from "../../services/canteen/feedbackservice";

export default function Feedback({ orderId }) {
  const handleSubmit = () => {
    submitFeedback(orderId, {
      taste: 4,
      quantity: 4,
      hygiene: 5
    });
    alert("Feedback submitted");
  };

  return (
    <div>
      <h2>Food Feedback</h2>
      <button onClick={handleSubmit}>Submit Feedback</button>
    </div>
  );
}
