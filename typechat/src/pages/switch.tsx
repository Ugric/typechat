const ToggleSwitch = ({
  children,
  onChange,
}: {
  children: string;
  onChange: (e: any) => void;
}) => (
  <label className="form-switch">
    <input type="checkbox" onChange={onChange} />
    <i></i>
    {children}
  </label>
);

export default ToggleSwitch;
