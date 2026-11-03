import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PasswordInput({ className = '', ...props }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        type={visivel ? 'text' : 'password'}
        className={className}
        style={{ width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
        {...props}
      />

      <button
        type="button"
        className="password-toggle-btn"
        tabIndex={-1}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={() => setVisivel((atual) => !atual)}
      >
        {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;
