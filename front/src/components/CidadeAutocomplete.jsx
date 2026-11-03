import { useEffect, useRef } from 'react';
import { useGoogleMapsScript } from '../hooks/useGoogleMapsScript';

function CidadeAutocomplete({ label, placeholder, valorInicial = '', onCidadeSelecionada }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { erro, setErro, carregarGoogleMaps } = useGoogleMapsScript();

  useEffect(() => {
    carregarGoogleMaps(iniciarAutocomplete);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = valorInicial || '';
    }
  }, [valorInicial]);

  function iniciarAutocomplete() {
    if (!inputRef.current) {
      return;
    }

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['(cities)'],
        componentRestrictions: { country: 'br' },
        fields: [
          'address_components',
          'geometry',
          'formatted_address',
          'name',
          'place_id',
        ],
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry || !place.geometry.location) {
        setErro('Não foi possível obter a localização dessa cidade.');
        return;
      }

      const componentes = place.address_components || [];

      const nomeCidade =
        buscarComponente(componentes, 'locality') ||
        buscarComponente(componentes, 'administrative_area_level_2') ||
        place.name;

      const estado = buscarComponente(
        componentes,
        'administrative_area_level_1',
        true
      );

      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      if (!nomeCidade || !estado) {
        setErro('Selecione uma cidade válida do Brasil.');
        return;
      }

      setErro('');

      onCidadeSelecionada({
        nome: nomeCidade,
        estado: estado,
        latitude: latitude,
        longitude: longitude,
        enderecoCompleto: place.formatted_address,
        placeId: place.place_id,
      });
    });
  }

  function buscarComponente(componentes, tipo, usarSigla = false) {
    const componente = componentes.find((item) => item.types.includes(tipo));

    if (!componente) {
      return '';
    }

    return usarSigla ? componente.short_name : componente.long_name;
  }

  function limparCidadeDigitada() {
    onCidadeSelecionada(null);
    setErro('');
  }

  return (
    <div className="form-group">
      <label>{label}</label>

      <input
        ref={inputRef}
        className="cidade-autocomplete-input"
        type="text"
        placeholder={placeholder}
        onChange={limparCidadeDigitada}
      />

      {erro && <small className="field-error">{erro}</small>}
    </div>
  );
}

export default CidadeAutocomplete;