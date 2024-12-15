import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateConfig } from "../../redux/HistoConfigSlice";
import { toggleClassification } from "../../redux/StreamGraphSlice";
import "./HistoControlBar.css";
import ReactSlider from "react-slider";
import * as d3 from "d3";

function HistoControlBar() {
  const dispatch = useDispatch();
  const selectedClassifications = useSelector(
    (state) => state.streamGraph.selectedClassifications
  );
  const data = useSelector((state) => state.dataSet.data);
  const dataFirewall = useSelector((state) => state.firewallDataSet.data);

  const [timeRange, setTimeRange] = useState([0, 0]);
  const [sliderValues, setSliderValues] = useState([0, 0]);
  const [displayFirewall, setDisplayFirewall] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  const classificationColors = d3.schemeCategory10;

  useEffect(() => {
    if (data.length > 0) {
      const times = data.map((d) => parseTime(d.time));
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      setTimeRange([minTime, maxTime]);
      setSliderValues([minTime, maxTime]);
    }
  }, [data]);

  const parseTime = (timeStr) => {
    const [day, time] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    return Number(day) * 1440 + hours * 60 + minutes;
  };

  const formatTime = (minutes) => {
    const day = Math.floor(minutes / 1440);
    const remainingMinutes = minutes % 1440;
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    return `${day} ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  const handleCheckboxChange = (index) => {
    dispatch(toggleClassification(index));
  };

  // initialize all the services
  useEffect(() => {
    if (dataFirewall.length > 0) {
      const initialServices = Array.from(new Set(dataFirewall.map((d) => d.dest_service)))
        .filter((service) => !service.includes("_")); // Exclude services with "_"
      setSelectedServices(initialServices); // Set all services as selected by default
    }
  }, [dataFirewall]); // Runs when dataFirewall changes  

  const handleServiceChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setSelectedServices(selectedOptions);
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
    dispatch(
      updateConfig({
        timeRange: sliderValues.map(formatTime),
        firewall_ips: displayFirewall,
        dest_services: selectedServices,
      })
    );
  };

  const uniqueServices = Array.from(new Set(dataFirewall.map((d) => d.dest_service)))
    .filter((service) => !service.includes("_") && !["domain", "telnet", "https", "kpop"].includes(service));

  return (
    <form className="control-bar-form" onSubmit={handleOnSubmit}>
      <div className="input-group-row">
        <div className="input-group service-dropdown">
          <label htmlFor="destService">Destination Service</label>
          <div className="custom-multi-select" id="destService">
            {uniqueServices.map((service, index) => (
              <label key={index} className="multi-select-option">
                <input
                  type="checkbox"
                  value={service}
                  checked={selectedServices.includes(service)}
                  onChange={(e) => {
                    const selected = e.target.checked
                      ? [...selectedServices, service]
                      : selectedServices.filter((s) => s !== service);
                    setSelectedServices(selected);
                  }}
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        <div className="input-group slider-group">
          <label htmlFor="timeRange">Time Range</label>
          <ReactSlider
            className="time-slider"
            min={timeRange[0]}
            max={timeRange[1]}
            value={sliderValues}
            onChange={setSliderValues}
            step={1}
            pearling
            renderThumb={(props, state) => <div {...props} />}
          />
          <div className="slider-labels">
            <span className="left">{formatTime(sliderValues[0])}</span>
            <span className="right">{formatTime(sliderValues[1])}</span>
          </div>

          {/* <div className="firewall-checkbox">
            <label>
              <input
                type="checkbox"
                checked={displayFirewall}
                onChange={(e) => setDisplayFirewall(e.target.checked)}
                style={{ marginTop: "5px" }}
              />
              Display Firewall
            </label>
          </div> */}
        </div>

        <div className="button-container">
          <button type="submit" className="generate-button">
            Generate
          </button>
        </div>
      </div>
    </form>
  );
}

export default HistoControlBar;