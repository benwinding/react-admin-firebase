import {storage} from './App'

import {
    useRecordContext,
    DeleteButton,
    BulkDeleteButton,
    useListContext
} from 'react-admin'


// IMPORTANT COMMENT
// You can't delete the folder because is deletes itself
// when you remove all the elements inside of it
function deleteFileFirestore(fileURL) {
    let fileRef = storage.refFromURL(fileURL)

    // Delete the file using the delete() method 
    fileRef.delete().then(function () {
        // File deleted successfully
        console.log("File Deleted")
    }).catch(function (error) {
        // Some Error occurred
        console.log("An error occured when deleting a file.")
    })
}

const getValueOfAnyWantedKey = (obj, wantedKey, array) => {

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      getValueOfAnyWantedKey(obj[i], wantedKey, array)
    }
  }
  else if (typeof obj === "object") {
    for (const key in obj) {
      if (key === wantedKey) {
      array.push(obj[key])
        delete obj[key]
      }
      getValueOfAnyWantedKey(obj[key], wantedKey, array)
    }
  }

  return array
}

export const CustomBulkDeleteButton = (props) => {
    const listContext = useListContext();

    const filterSelectedIds = (arr1, arr2) => {
        let res = [];
        res = arr1.filter(el => {
           return arr2.find(element => {
              return element === el.id;
           });
        });
        return res;
      }

    const handleDelete = () => {
        const select = listContext.selectedIds

        const result = filterSelectedIds(listContext.data, select)

        result.forEach(function (el) {
          let sources = []
          getValueOfAnyWantedKey(el, 'src', sources)
            // delete files in storage
          for (const src of sources){
            deleteFileFirestore(src)
          }
        })
    }
    return (
         <BulkDeleteButton onClick={handleDelete} {...props}/>
    )
}


export const CustomDeleteButton = (props) => {
    const record = useRecordContext();

    const handleClick = () => {
      const sources = []
      getValueOfAnyWantedKey(record, 'src', sources)
      // delete files in storage
      for (const src of sources){
        deleteFileFirestore(src)
      }
        // then delete in db but if you use DeleteButton there is no use for useDelete
    }

    return <DeleteButton onClick={handleClick} {...props}/>;
}

export default CustomDeleteButton;