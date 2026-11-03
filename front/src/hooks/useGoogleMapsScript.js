import { useState } from 'react';


export function useGoogleMapsScript() {
  const [erro, setErro] = useState('');

  function carregarGoogleMaps(aoCarregar) {
    if (window.google && window.google.maps && window.google.maps.places) {
      aoCarregar();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setErro('Chave do Google Maps não configurada no arquivo .env');
      return;
    }

    const scriptExistente = document.getElementById('google-maps-script');

    if (scriptExistente) {
      scriptExistente.addEventListener('load', aoCarregar);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR`;
    script.async = true;
    script.defer = true;
    script.onload = aoCarregar;

    document.body.appendChild(script);
  }

  return { erro, setErro, carregarGoogleMaps };
}
