import React from "react";
import ReactDOM from "react-dom";
import "./TooltipPortal.css";

const TooltipPortal = () => {
  return ReactDOM.createPortal(
    <div id="tooltip-container">
      {/* This container is dynamically populated by child components */}
    </div>,
    document.body
  );
};

export default TooltipPortal;