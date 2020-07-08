import React, { useEffect, useState } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
// import ReactMapGL, { Marker, Layer, Popup, Source } from "react-map-gl";

// https://studio.mapbox.com/

export default function App() {
  const initState = {
    latitude: 0,
    longitude: 0,
    width: "100vw",
    height: "100vh",
    zoom: 1.5,
    minZoom: 1.5,
  };
  const [datos, setDatos] = useState(null);
  const [leyenda, setLeyenda] = useState(null);
  const [leyendaPeru, setLeyendaPeru] = useState(null);

  const [viewport, setViewport] = useState(initState);
  const [selectedVirus, setSelectedVirus] = useState(null);

  let mapa = React.useRef();

  const getDatos = async () => {
    const response = await fetch(
      "https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/latest"
    );
    const data = await response.json();
    const aux = data.filter((item) => item.confirmed > 0);
    aux.forEach((element, index) => {
      element["id"] = index;
      element["title"] = element.countryregion + " " + element.provincestate;
      return element;
    });
    // mapa.current().on("load", () => {
    //   mapa.addSource("route", {
    //     type: "geojson",
    //     data: {
    //       type: "Feature",
    //       properties: {},
    //       geometry: {
    //         type: "LineString",
    //         coordinates: [
    //           [-122.48369693756104, 0],
    //           [0, 122],
    //         ],
    //       },
    //     },
    //   });
    // });
    setDatos(aux);
  };

  const getLeyenda = async () => {
    const response = await fetch(
      "https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/brief"
    );
    const data = await response.json();
    setLeyenda(data);
  };

  const getLeyendaPeru = async () => {
    const response = await fetch(
      "https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/latest?iso3=PER"
    );
    const data = await response.json();
    // const fecha = Date.parse(data[0].lastupdate);
    const fecha = new Date(data[0].lastupdate);
    data[0].lastupdate = fecha.toLocaleDateString("es-ES");
    console.log(data[0].lastupdate, typeof data[0].lastupdate);
    setLeyendaPeru(data[0]);
  };

  useEffect(() => {
    getDatos();
    getLeyenda();
    getLeyendaPeru();
  }, []);

  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedVirus(null);
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  const handleChange = (viewport) => {
    setViewport(viewport);
  };

  //configuracion para las lineas
  // const geojson = {
  //   type: "FeatureCollection",
  //   features: [
  //     {
  //       type: "Feature",
  //       geometry: {
  //         type: "LineString",
  //         coordinates: [
  //           [-49, -9],
  //           [-106, 41.88],
  //           [41.3, 51.5],
  //           [-42.9, -15.6],
  //         ],
  //       },
  //     },
  //   ],
  // };

  // const flag = false; //variable conditional para modificar el color de la linea

  if (!datos || !leyenda || !leyendaPeru)
    return (
      <div>
        <h1>Cargando</h1>
      </div>
    );
  else {
    return (
      <div>
        <div className="restart">
          <img
            src="/radar.svg"
            alt="Radar Icon"
            className="radar-img"
            onClick={() => setViewport(initState)}
          />
        </div>
        <div className="legend">
          <h3 className="blanco">Datos totales a nivel mundial</h3>
          <h5 className="blanco">
            Confirmados:{" "}
            {new Intl.NumberFormat().format(Number(leyenda.confirmed))}
          </h5>
          <h5 className="blanco">
            Muertos: {new Intl.NumberFormat().format(Number(leyenda.deaths))}
          </h5>
          <h5 className="blanco">
            Recuperados:{" "}
            {new Intl.NumberFormat().format(Number(leyenda.recovered))}
          </h5>
          <hr></hr>
          <h3 className="blanco">Datos totales en Peru</h3>
          <h5 className="blanco">
            Ultima actualizacion: {leyendaPeru.lastupdate}
          </h5>
          <h5 className="blanco">
            Confirmados:{" "}
            {new Intl.NumberFormat().format(Number(leyendaPeru.confirmed))}
          </h5>
          <h5 className="blanco">
            Muertos:{" "}
            {new Intl.NumberFormat().format(Number(leyendaPeru.deaths))}
          </h5>
          <h5 className="blanco">
            Recuperados:{" "}
            {new Intl.NumberFormat().format(Number(leyendaPeru.recovered))}
          </h5>
        </div>
        <div>
          <ReactMapGL
            {...viewport}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            mapStyle="mapbox://styles/patricksk/ck7y7oy570lge1inwfe7goe8w"
            onViewportChange={(viewport) => handleChange(viewport)}
          >
            {datos.map((item) => (
              <Marker
                key={item.id}
                latitude={item.location.lat}
                longitude={item.location.lng}
              >
                <button
                  className="marker-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVirus(item);
                  }}
                >
                  <img src="/virus.svg" alt="Virus Icon" />
                </button>
              </Marker>
            ))}

            {/* <Source id="my-data" type="geojson" data={geojson}> */}
            {/* draw circle */}
            {/* <Layer
                id="point"
                type="circle"
                paint={{
                  "circle-radius": 50,
                  "circle-color": "#007cbf",
                }}
              /> */}
            {/* draw lines */}
            {/* <Layer
                id="linea"
                type="line"
                layout={{
                  "line-join": "bevel",
                  "line-cap": "round",
                }}
                paint={{
                  // "line-color": "rgba(3, 170, 238, 0.5)",
                  "line-color": `${flag ? "red" : "blue"}`,
                  "line-width": 20,
                }} */}
            {/* />
            </Source> */}

            {selectedVirus ? (
              <Popup
                latitude={selectedVirus.location.lat}
                longitude={selectedVirus.location.lng}
                onClose={() => {
                  setSelectedVirus(null);
                }}
              >
                <div>
                  <h3>{selectedVirus.title}</h3>
                  <hr />
                  <h5>Confirmados: {selectedVirus.confirmed}</h5>
                  <h5>Muertos: {selectedVirus.deaths}</h5>
                  <h5>Recuperados: {selectedVirus.recovered}</h5>
                </div>
              </Popup>
            ) : null}
          </ReactMapGL>
        </div>
      </div>
    );
  }
}
