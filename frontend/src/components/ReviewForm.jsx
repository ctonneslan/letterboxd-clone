import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ReviewForm({ movieId, existingReview, onSubmit, onCancel }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [containsSpoilers, setContainsSpoilers] = useState(existingReview?.containsSpoilers || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setReviewText(existingReview.reviewText || '');
      setContainsSpoilers(existingReview.containsSpoilers || false);
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to write a review');
      return;
    }

    if (rating === 0 && !reviewText.trim()) {
      setError('Please provide a rating or review text');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        movieId,
        rating: rating || null,
        reviewText: reviewText.trim() || null,
        containsSpoilers,
      });

      // Reset form if creating new review
      if (!existingReview) {
        setRating(0);
        setReviewText('');
        setContainsSpoilers(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to save review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      const filled = i <= (hoveredRating || rating);
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`text-2xl transition-colors ${
            filled ? 'text-letterboxd-orange' : 'text-gray-600'
          } hover:text-letterboxd-orange`}
          aria-label={`Rate ${i} out of 10`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-2xl font-bold mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Star Rating */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Rating (optional)
        </label>
        <div className="flex gap-1">
          {renderStars()}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            {rating}/10 stars
          </p>
        )}
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <label htmlFor="reviewText" className="block text-sm font-semibold mb-2">
          Review (optional)
        </label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          className="input-field min-h-[150px] resize-y"
          maxLength={5000}
        />
        <p className="text-sm text-gray-500 mt-1">
          {reviewText.length}/5000 characters
        </p>
      </div>

      {/* Spoilers Checkbox */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={containsSpoilers}
            onChange={(e) => setContainsSpoilers(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-dark-bg text-letterboxd-green focus:ring-letterboxd-green focus:ring-offset-dark-bg"
          />
          <span className="text-sm">This review contains spoilers</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : existingReview ? 'Update Review' : 'Post Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
