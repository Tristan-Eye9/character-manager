import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const AttributeCard = ({ name, value, onChange, pointsLeft, usePointBuy }) => {
  const modifier = Math.floor((value - 10) / 2);
  const cost = value < 14 ? 1 : 2;
  // When using point buy, the cap is 15. In free mode, cap is 30.
  const canIncrease = usePointBuy
    ? pointsLeft >= cost && value < 15
    : value < 30;
  const canDecrease = usePointBuy ? value > 8 : true;

  return (
    <div className="card h-100 shadow-sm border-primary">
      <div className="card-header bg-primary text-white">{name}</div>
      <div className="card-body d-flex flex-column align-items-center">
        <h2 className="mb-3">{value}</h2>
        <div className="mb-3">
          <span
            className={`badge ${modifier >= 0 ? "bg-success" : "bg-danger"}`}
          >
            {modifier >= 0 ? "+" : ""}
            {modifier}
          </span>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-primary"
            onClick={() => canDecrease && onChange(value - 1)}
            disabled={!canDecrease}
            aria-label={`Decrease ${name}`}
          >
            -
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => canIncrease && onChange(Math.min(value + 1, 30))}
            disabled={!canIncrease}
            aria-label={`Increase ${name}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // Load saved attributes or use defaults.
  const initialState = JSON.parse(localStorage.getItem("attributes")) || {
    str: 8,
    dex: 8,
    con: 8,
    int: 8,
    wis: 8,
    cha: 8,
  };

  const [attributes, setAttributes] = useState(initialState);
  const [usePointBuy, setUsePointBuy] = useState(true);
  const [selectedModifier, setSelectedModifier] = useState("str");
  const [rollResult, setRollResult] = useState(null);

  // Calculate remaining points only in point buy mode.
  const calculatePoints = () => {
    if (!usePointBuy) return 27;
    return (
      27 -
      Object.values(attributes).reduce((sum, val) => {
        if (val <= 13) return sum + (val - 8);
        return sum + 5 + (val - 13) * 2;
      }, 0)
    );
  };

  const pointsLeft = calculatePoints();

  useEffect(() => {
    localStorage.setItem("attributes", JSON.stringify(attributes));
  }, [attributes]);

  const handleChange = (attr, value) => {
    setAttributes((prev) => ({ ...prev, [attr]: value }));
  };

  const resetAttributes = () => {
    setAttributes({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
  };

  const togglePointBuy = () => {
    setUsePointBuy((prev) => !prev);
  };

  // Roll a d20 and add the selected attribute's modifier.
  const handleRollDice = () => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const mod = Math.floor((attributes[selectedModifier] - 10) / 2);
    setRollResult(d20 + mod);
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h1 className="display-4 mb-3">D&D Attribute Manager</h1>
        <div className="form-check form-switch d-inline-block mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="pointBuySwitch"
            checked={usePointBuy}
            onChange={togglePointBuy}
          />
          <label className="form-check-label" htmlFor="pointBuySwitch">
            Use Point Buy Restrictions
          </label>
        </div>
        {usePointBuy ? (
          <div
            className={`alert ${
              pointsLeft < 0 ? "alert-danger" : "alert-info"
            }`}
          >
            Points remaining: {pointsLeft}
          </div>
        ) : (
          <div className="alert alert-success">Free form mode activated.</div>
        )}
        <button
          className="btn btn-danger reset-button mb-3"
          onClick={resetAttributes}
          disabled={usePointBuy ? pointsLeft === 27 : false}
        >
          Reset All
        </button>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {Object.entries(attributes).map(([attr, value]) => (
          <div key={attr} className="col">
            <AttributeCard
              name={attr.toUpperCase()}
              value={value}
              onChange={(val) => handleChange(attr, val)}
              pointsLeft={pointsLeft}
              usePointBuy={usePointBuy}
            />
          </div>
        ))}
      </div>

      {/* Dice Roller Section */}
      <div className="dice-roller d-flex flex-column align-items-center mt-5">
        <h4>Roll Dice</h4>
        <div className="d-flex align-items-center mb-3">
          <label className="me-2" htmlFor="attributeSelect">
            Modifier:
          </label>
          <select
            id="attributeSelect"
            className="form-select w-auto"
            value={selectedModifier}
            onChange={(e) => setSelectedModifier(e.target.value)}
          >
            {Object.keys(attributes).map((attr) => (
              <option key={attr} value={attr}>
                {attr.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        {/* Side-by-side container for Roll Button and Result */}
        <div className="d-flex align-items-center">
          <button className="btn my-d20-btn me-3" onClick={handleRollDice}>
            Roll d20
          </button>
          {rollResult !== null && (
            <div
              className="alert alert-warning mb-0"
              style={{ padding: "0.5rem 1rem" }}
            >
              Roll Result: {rollResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
