import { FiStar } from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} size={size} className="text-star" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} size={size} className="text-star" />);
    } else {
      stars.push(<FiStar key={i} size={size} className="text-muted-foreground/40" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}
