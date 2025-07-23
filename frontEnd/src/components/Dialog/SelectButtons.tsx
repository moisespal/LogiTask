type Props = {
  selected: number | null;
  setSelected: (index: number) => void;
  buttons: string[];
};

const SelectButtons = ({ selected, setSelected, buttons }: Props) => {
  return (
    <div className="select-buttons-container">
      {buttons.map((label, index) => (
        <button
          key={label}
          className={`select-button ${selected === index ? 'selected' : ''}`}
          onClick={() => setSelected(index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SelectButtons;