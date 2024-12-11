import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateFromConfig } from "../../redux/HeatmapConfigSlice";
import "./HeatmapControlBar.css"; // Assuming CSS is imported for styling
import ReactSlider from "react-slider";

function HeatmapControlBar() {
    const dispatch = useDispatch();
    // Fetch current category from the Redux store
    const currentCategory = useSelector((state) => state.heatmapConfig.category);
    // Fetch data from the Redux store
    const data = useSelector((state) => state.dataSet.data);
    const [timeRange, setTimeRange] = useState([0, 0]); // Holds the slider's min and max time
    const [selectedCategory, setSelectedCategory] = useState(currentCategory); // Default to 'suspect IPs'
    const [sliderValues, setSliderValues] = useState([0, 0]); // Selected range

    // Extract time range from the dataset when data is available
    useEffect(() => {
        if (data.length > 0) {
            const times = data.map((d) => parseTime(d.time));
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            setTimeRange([minTime, maxTime]);
            setSliderValues([minTime, maxTime]);
        }
    }, [data]);

    // Parse "D HH:MM" format into a comparable number
    const parseTime = (timeStr) => {
        const [day, time] = timeStr.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        return Number(day) * 1440 + hours * 60 + minutes; // Convert to total minutes
    };

    // Format minutes back into "D HH:MM"
    const formatTime = (minutes) => {
        const day = Math.floor(minutes / 1440);
        const remainingMinutes = minutes % 1440;
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;
        return `${day} ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    };

    // Handle dropdown selection
    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    // Handle slider changes
    const handleSliderChange = (event) => {
        const [start, end] = event.target.value.split(",").map(Number);
        setSliderValues([start, end]);
    };

    // Dispatch settings to Redux when the button is clicked
    const handleOnSubmit = (event) => {
        event.preventDefault();
        dispatch(
            generateFromConfig({
                category: selectedCategory,
                timeRange: sliderValues.map(formatTime), // Convert back to readable time
            })
        );
    };

    return (
        <form className="control-bar-form" onSubmit={handleOnSubmit}>
        <div className="input-group-row">
          {/* Dropdown for IP category */}
          <div className="input-group">
            <label htmlFor="category">IP Category</label>
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="suspect">Suspect IPs</option>
              <option value="generic">Generic IPs</option>
            </select>
          </div>
      
          {/* Time slider */}
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
              renderThumb={(props, state) => (
                // Remove the value from the thumb
                <div {...props} />
              )}
            />
            <div className="slider-labels">
              <span className="left">{formatTime(sliderValues[0])}</span>
              <span className="right">{formatTime(sliderValues[1])}</span>
            </div>
          </div>
      
          {/* Submit button */}
          <div className="button-container">
            <button type="submit" className="generate-button">
              Generate
            </button>
          </div>
        </div>
      </form>
      

      

    );
}

export default HeatmapControlBar;
