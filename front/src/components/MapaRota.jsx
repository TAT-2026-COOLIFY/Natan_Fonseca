import { useEffect, useRef, useState } from 'react';
import { useGoogleMapsScript } from '../hooks/useGoogleMapsScript';


function indiceMaisProximoDaReferencia(opcoes, distanciaReferenciaKm) {
  if (distanciaReferenciaKm == null || opcoes.length === 0) {
    return 0;
  }

  let indiceEscolhido = 0;
  let menorDiferenca = Infinity;

  opcoes.forEach((opcao) => {
    const diferenca = Math.abs(opcao.distanciaKm - distanciaReferenciaKm);

    if (diferenca < menorDiferenca) {
      menorDiferenca = diferenca;
      indiceEscolhido = opcao.indice;
    }
  });

  return indiceEscolhido;
}

function MapaRota({
  origem,
  destino,
  distanciaReferenciaKm,
  selecionavel = true,
  onRotaSelecionada,
}) {
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const { erro, setErro, carregarGoogleMaps } = useGoogleMapsScript();
  const [opcoesRota, setOpcoesRota] = useState([]);
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);

  useEffect(() => {
    if (origem && destino) {
      carregarGoogleMaps(iniciarMapa);
    }
  }, [origem, destino]);

  useEffect(() => {
    if (!directionsRendererRef.current || opcoesRota.length === 0) {
      return;
    }

    directionsRendererRef.current.setRouteIndex(indiceSelecionado);

    const opcaoAtual = opcoesRota[indiceSelecionado];

    if (opcaoAtual && onRotaSelecionada) {
      onRotaSelecionada(opcaoAtual);
    }
  }, [indiceSelecionado, opcoesRota]);

  function iniciarMapa() {
    if (!mapRef.current || !origem || !destino) {
      return;
    }

    setErro('');
    setOpcoesRota([]);
    setIndiceSelecionado(0);

    const origemLatLng = {
      lat: Number(origem.latitude),
      lng: Number(origem.longitude),
    };

    const destinoLatLng = {
      lat: Number(destino.latitude),
      lng: Number(destino.longitude),
    };

    const map = new window.google.maps.Map(mapRef.current, {
      center: origemLatLng,
      zoom: 8,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    const directionsService = new window.google.maps.DirectionsService();

    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: map,
    });

    directionsRendererRef.current = directionsRenderer;

    directionsRenderer.addListener('directions_changed', () => {
      setIndiceSelecionado(directionsRenderer.getRouteIndex());
    });

    directionsService.route(
      {
        origin: origemLatLng,
        destination: destinoLatLng,
        travelMode: window.google.maps.TravelMode.DRIVING,
        region: 'BR',
        unitSystem: window.google.maps.UnitSystem.METRIC,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          const opcoes = result.routes.map((rota, indice) => {
            const leg = rota.legs[0];

            return {
              indice,
              resumo: rota.summary || `Opção ${indice + 1}`,
              distanciaTexto: leg?.distance?.text,
              duracaoTexto: leg?.duration?.text,
              distanciaKm: leg ? leg.distance.value / 1000 : null,
              duracaoMinutos: leg ? leg.duration.value / 60 : null,
            };
          });

          const indiceEscolhido = indiceMaisProximoDaReferencia(opcoes, distanciaReferenciaKm);

          if (selecionavel) {
            directionsRenderer.setDirections(result);
            setOpcoesRota(opcoes);
            setIndiceSelecionado(indiceEscolhido);
          } else {
          
            directionsRenderer.setDirections({
              ...result,
              routes: [result.routes[indiceEscolhido]],
            });
            setOpcoesRota([{ ...opcoes[indiceEscolhido], indice: 0 }]);
            setIndiceSelecionado(0);
          }
        } else {
          setErro('Não foi possível desenhar a rota no mapa.');
        }
      }
    );
  }

  if (!origem || !destino) {
    return null;
  }

  const opcaoSelecionada = opcoesRota[indiceSelecionado];

  return (
    <div className="map-route-card">
      <div className="map-route-header">
        <div>
          <h3>Prévia do trajeto</h3>
          <p>Confira no mapa o caminho estimado entre origem e destino</p>
        </div>

        {opcaoSelecionada && (
          <div className="map-route-info">
            <div>
              <span>Distância</span>
              <strong>{opcaoSelecionada.distanciaTexto}</strong>
            </div>

            <div>
              <span>Duração</span>
              <strong>{opcaoSelecionada.duracaoTexto}</strong>
            </div>
          </div>
        )}
      </div>

      {erro && <div className="error-message-page">{erro}</div>}

      {opcoesRota.length > 1 && (
        <div className="map-route-options">
          {opcoesRota.map((opcao) => (
            <button
              key={opcao.indice}
              type="button"
              className={
                opcao.indice === indiceSelecionado
                  ? 'map-route-option map-route-option-ativa'
                  : 'map-route-option'
              }
              onClick={() => setIndiceSelecionado(opcao.indice)}
            >
              <span>
                Rota {opcao.indice + 1} · via {opcao.resumo}
              </span>
              <small>
                {opcao.distanciaTexto} · {opcao.duracaoTexto}
              </small>
            </button>
          ))}
        </div>
      )}

      <div ref={mapRef} className="map-route"></div>
    </div>
  );
}

export default MapaRota;
