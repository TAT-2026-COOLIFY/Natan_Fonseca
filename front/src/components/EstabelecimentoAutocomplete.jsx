import { useEffect, useRef } from 'react';
import { useGoogleMapsScript } from '../hooks/useGoogleMapsScript';

// raio em volta do centro da cidade usado pra limitar as sugestoes
const RAIO_BUSCA_METROS = 15000;

function normalizarTexto(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function EstabelecimentoAutocomplete({
  label,
  placeholder,
  valorInicial = '',
  disabled = false,
  cidade = null,
  onEstabelecimentoSelecionado,
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const cidadeRef = useRef(cidade);

  const { erro, setErro, carregarGoogleMaps } = useGoogleMapsScript();

  useEffect(() => {
    carregarGoogleMaps(iniciarAutocomplete);
  }, []);

  useEffect(() => {
    cidadeRef.current = cidade;

    if (autocompleteRef.current) {
      autocompleteRef.current.setOptions(montarRestricaoDaCidade());
    }
  }, [cidade?.latitude, cidade?.longitude, cidade?.nome]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = valorInicial || '';
    }
  }, [valorInicial]);

  function montarRestricaoDaCidade() {
    const atual = cidadeRef.current;

    if (atual?.latitude == null || atual?.longitude == null) {
      return { bounds: undefined, strictBounds: false };
    }

    const area = new window.google.maps.Circle({
      center: { lat: atual.latitude, lng: atual.longitude },
      radius: RAIO_BUSCA_METROS,
    });

    // strictBounds faz o Google so sugerir lugares dentro da area da cidade
    return { bounds: area.getBounds(), strictBounds: true };
  }

  function lugarEstaNaCidade(place) {
    const nomeCidade = normalizarTexto(cidadeRef.current?.nome);

    if (!nomeCidade) {
      return true;
    }

    const cidadeDoLugar = (place.address_components || []).find((componente) =>
      componente.types.includes('administrative_area_level_2')
    );

    if (cidadeDoLugar) {
      return normalizarTexto(cidadeDoLugar.long_name) === nomeCidade;
    }

    return normalizarTexto(place.formatted_address).includes(nomeCidade);
  }

  function iniciarAutocomplete() {
    if (!inputRef.current || autocompleteRef.current) {
      return;
    }

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        // so estabelecimento de saude, "establishment" sozinho trazia
        // loja, mercado, qualquer coisa
        types: ['hospital', 'doctor', 'physiotherapist', 'dentist', 'pharmacy'],
        componentRestrictions: { country: 'br' },
        fields: [
          'name',
          'formatted_address',
          'address_components',
          'geometry',
          'place_id',
          'types',
        ],
        ...montarRestricaoDaCidade(),
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();

      if (!place || !place.name) {
        setErro('Selecione um hospital ou clínica válido.');
        return;
      }

      if (!lugarEstaNaCidade(place)) {
        setErro(`Selecione um local em ${cidadeRef.current.nome}, cidade de destino da viagem.`);
        inputRef.current.value = '';
        onEstabelecimentoSelecionado(estabelecimentoVazio(''));
        return;
      }

      const latitude = place.geometry?.location?.lat
        ? place.geometry.location.lat()
        : null;

      const longitude = place.geometry?.location?.lng
        ? place.geometry.location.lng()
        : null;

      setErro('');

      onEstabelecimentoSelecionado({
        nome: place.name,
        enderecoCompleto: place.formatted_address || '',
        latitude,
        longitude,
        placeId: place.place_id,
        tipos: place.types || [],
      });
    });
  }

  function estabelecimentoVazio(nome) {
    return {
      nome,
      enderecoCompleto: '',
      latitude: null,
      longitude: null,
      placeId: null,
      tipos: [],
    };
  }

  function alterarTexto(event) {
    setErro('');
    onEstabelecimentoSelecionado(estabelecimentoVazio(event.target.value));
  }

  return (
    <div className="form-group">
      <label>{label}</label>

      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        onChange={alterarTexto}
      />

      {erro && <small className="field-error">{erro}</small>}
    </div>
  );
}

export default EstabelecimentoAutocomplete;
