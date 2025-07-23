import React from "react";

const ThoughtProcess = ({ steps }) => (
  <div className="thought-process">
    <h3>Reasoning Steps</h3>
    {steps.map((step, index) => (
      <div key={index} className="reasoning-step">
        {step}
      </div>
    ))}
  </div>
);

export default ThoughtProcess;
