import { useNavigate } from 'react-router-dom';

function BackButton({ children = 'Back' }) {
  const navigate = useNavigate();
  return (
    <button className="btn-outline" onClick={() => navigate(-1)}>
      {children}
    </button>
  );
}

export default BackButton;