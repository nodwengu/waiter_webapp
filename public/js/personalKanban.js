
function createTask(data) {
   let name = "";
   let description = "";
   let status = "";
   let time = new Date;
   let date = new Date;
   let id = 1;

   let toDoList = data || [];
   let doingList = [];
   let doneList = [];

   function setTask(theName, theDesc, theStatus, theTime, theDate) {
      name = theName;
      description = theDesc;
      status = theStatus;
      time = theTime;
      date = theDate;
      id++;

      toDoList.push({
         name,
         description,
         status,
         time,
         date,
         id
      })
   }
  
   function getTodoList() {
     return toDoList;
   }

   function setDoingList(obj) {
      if(doingList.length > 0) {
         alert("You can work on only one task at a time!!");
         return
      }
      doingList.push(obj);
   }
   function getDoingList() {
      return doingList
   }

   function setDoneList(obj) {
      doneList.push(obj);
   }

   function getDoneList() {
      return doneList;
   }
  

   return {
      setTask,
      setDoingList,
      setDoneList,

      getTodoList,
      getDoingList,
      getDoneList

      
   }

  
}