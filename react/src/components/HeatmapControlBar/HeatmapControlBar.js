import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateFromConfig } from "../../redux/ConfigSlice";

function ControlBar() {
    const dispatch = useDispatch();

    // Fetch the current configuration from the Redux store
    const genConfig = useSelector((state) => state.config || { xAxis: '', yAxis: ''});

    // Fetch column names from the data slice in order to display them in the dropdown menus
    const data = useSelector((state) => state.dataSet);
    const [columnNames, setColumnNames] = useState([]);

    // Local state for user selections
    const [selectedXAxis, setSelectedXAxis] = useState(genConfig.xAxis || '');
    const [selectedYAxis, setSelectedYAxis] = useState(genConfig.yAxis || '');

    // Extract column names when data is loaded so that they are properly displayed 
    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]).filter((name) => name !== "index");
            setColumnNames(columns);
        }
    }, [data]);

    // Update local state when user changes the dropdown selection
    const handleOnChangeXAxis = (event) => {
        setSelectedXAxis(event.target.value);
    };

    const handleOnChangeYAxis = (event) => {
        setSelectedYAxis(event.target.value);
    };

    // Dispatch all the settings to the Redux store when the user clicks on the button
    const handleOnSubmit = (event) => {
        event.preventDefault();
        dispatch(generateFromConfig({
            xAxis: selectedXAxis,
            yAxis: selectedYAxis
        }));
    };

    return (
        <form className="control-bar-form" onSubmit={handleOnSubmit}>
            <div className="input-group-row">
                <div className="input-group">
                    <label htmlFor="xAxis">X-axis</label>
                    <select
                        id="xAxis"
                        name="xAxis"
                        value={selectedXAxis}
                        onChange={handleOnChangeXAxis}
                    >
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="yAxis">Y-axis</label>
                    <select
                        id="yAxis"
                        name="yAxis"
                        value={selectedYAxis}
                        onChange={handleOnChangeYAxis}
                    >
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="button-container">
                <button type="submit" className="generate-button">Generate</button>
            </div>
        </form>
    );

}

export default ControlBar;