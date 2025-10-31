import React from "react";

type inputValue = { company: string; position: string; yoe: string };
type InputModalProps = {
  inputValues: inputValue;
  setInputValues: React.Dispatch<React.SetStateAction<inputValue>>;
  setOpenInputModal: React.Dispatch<React.SetStateAction<boolean>>;
};
export function InputModal({
  inputValues,
  setInputValues,
  setOpenInputModal,
}: InputModalProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id;

    setInputValues((prev) => ({ ...prev, [id]: e.target.value }));

    console.log("inputValues; ", inputValues);
    // setOpenInputModal((prev) => !prev);
  };
  return (
    <form>
      <input id="company" value={inputValues.company} onChange={handleChange} />
      <input
        id="position"
        value={inputValues.position}
        onChange={handleChange}
      />
      <input id="yoe" value={inputValues.company} onChange={handleChange} />

      <button>Submit</button>
    </form>
  );
}
