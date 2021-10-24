import playSound from "../playsound";

const ToggleSwitch = ({
  children,
  onChange,
  defaultChecked,
  checked,
}: {
  children?: string;
  onChange?: Function;
  checked?: boolean;
  defaultChecked?: boolean;
}) => (
  <div style={ { display: "flex", justifyContent: "space-between" } }>
    <div>{ children }</div>
    <label style={ { margin: 0 } } className="form-switch noselect">
      <input
        type="checkbox"
        onChange={ (e: any) => {
          if (onChange instanceof Function) {
            onChange(e);
            playSound(`/sounds/click${checked ? 1 : 3}.mp3`);
          }
        } }
        checked={ checked }
        defaultChecked={ defaultChecked }
      />
      <i></i>
    </label>
  </div>
);

export default ToggleSwitch;
