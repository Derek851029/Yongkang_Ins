import React, {createContext} from 'react';

export default React.createContext({
  tasks: "",
  addNewTask: (task) => {}
})