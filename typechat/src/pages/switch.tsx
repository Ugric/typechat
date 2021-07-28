const ToggleSwitch = ({
  children,
  onChange,
  defaultChecked,
}: {
  children: string;
  onChange: (e: any) => void;
  defaultChecked: boolean;
}) => (
  <label className="form-switch">
    <input
      type="checkbox"
      onChange={onChange}
      defaultChecked={defaultChecked}
    />
    <i></i>
    {children}
  </label>
);

export default ToggleSwitch;
