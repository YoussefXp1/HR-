import { useState } from "react";

interface Props {
  items: string[];
  heading: string;
  onSelectItem: (item: string) => void;
}
function ListGroup({ items, heading, onSelectItem }: Props) {
  //A component can't return more than one element
  //if you want it to return more than one element the you need to use (    fragment)
  // we can't write a if statement in jsx (only html and react comps )

  //hook .. this component will have data and will change overtime
  const [selectedIndex, setSelectedIndex] = useState(-1);
  //items = [];

  return (
    <>
      <h1>{heading}</h1>
      {items.length === 0 && <p>No Items Found</p>}
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={item}
            onClick={() => {
              setSelectedIndex(index);
              onSelectItem(item);
            }}
          >
            {" "}
            {item}{" "}
          </li>
        ))}
      </ul>
    </>
  );
}
export default ListGroup;
