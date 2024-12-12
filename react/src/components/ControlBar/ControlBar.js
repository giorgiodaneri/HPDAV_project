import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateFromConfig } from "../../redux/HeatmapConfigSlice";
import { toggleClassification } from "../../redux/StreamGraphSlice";
import "./ControlBar.css";
import ReactSlider from "react-slider";
import * as d3 from "d3";

function ControlBar() {
  const dispatch = useDispatch();
  const selectedClassifications = useSelector(
    (state) => state.streamGraph.selectedClassifications
  );
  const data = useSelector((state) => state.dataSet.data);
  const [timeRange, setTimeRange] = useState([0, 0]);
  const [sliderValues, setSliderValues] = useState([0, 0]);

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

  const handleOnSubmit = (event) => {
    event.preventDefault();
    dispatch(
      generateFromConfig({
        filters: selectedClassifications,
        timeRange: sliderValues.map(formatTime),
      })
    );
  };

  return (
    <form className="control-bar-form" onSubmit={handleOnSubmit}>
      <div className="input-group-row">
        <div className="input-group" style={{ width: "30%", textAlign: "left" }}>
          <label>Filter Categories</label>
          {[
            "Generic Protocol Command Decode",
            "Potential Corporate Privacy Violation",
            "Misc activity",
            "Attempted Information Leak",
            "Potentially Bad Traffic",
          ].map((label, index) => (
            <label
              key={index}
              style={{
                color: classificationColors[index],
                marginRight: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selectedClassifications.includes(index)}
                onChange={() => handleCheckboxChange(index)}
                style={{ marginRight: "5px" }}
              />
              {label}
            </label>
          ))}
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

export default ControlBar;
