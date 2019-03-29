/*****************************************************************************************
* Part 2
****************************************************************************************/
const employees = [
        {first: "Amanda", last: "Byron", group: "Sales"},
        {first: "Ye", last: "Xia", group: "Receiving", nameOrder: "reverse"},
        {first: "Miltiades", last: "Crescens", group: "Sales"},
        /*...don't foget to account for other entries of the same form, but with different group names.....*/
    ];

// Part 2 Answer Here

const organizeByGroup = (employeesList) => {
  const sortedEmployees = employeesList.sort((a, b) => {
    const groupA = a.group.toUpperCase();
    const groupB = b.group.toUpperCase();
    if(groupA < groupB) {
      return -1;
    }
    if(groupA > groupB) {
      return 1;
    }
    return 0
  });

  const employeesByGroup = sortedEmployees.reduce((groupsObj, employee) => {
    if(!groupsObj[employee.group]) {
      groupsObj[employee.group] = []
    }; 
    
    groupsObj[employee.group].push({'name': `${employee.first} ${employee.last}`});
    
    return groupsObj;
  }, {});

  return employeesByGroup;
}

organizeByGroup(employees)

/*****************************************************************************************
* Bonus
****************************************************************************************/

// Bonus Anwser Here
