const properties = {
  "dynamic": "false",
  "properties": {
    "company": {
      "properties": {
        "id": {
          "type": "keyword"
        }
      }
    },
    "division": {
      "properties": {
        "id": {
          "type": "keyword"
        }
      }
    },
    "education": {
      "properties": {
        "id": {
          "type": "keyword"
        }
      }
    },
    "employmentType": {
      "properties": {
        "id": {
          "type": "keyword"
        }
      }
    },
    "experienceLevel": {
      "properties": {
        "id": {
          "type": "keyword"
        }
      }
    },
    "hoursPerWeek": {
      "properties": {
        "max": {
          "type": "integer"
        },
        "min": {
          "type": "integer"
        }
      }
    },
    "jobArea": {
      "properties": {
        "id": {
          "type": "keyword"
        },
        "name": {
          "type": "text"
        }
      }
    },
    "publishedDate": {
      "type": "long"
    },
    "title": {
      "type": "text"
    },
    "updatedDate": {
      "type": "long"
    }
  }
}

// const properties = {
//   title: {
//     type: 'keyword',
//   },
//   education: {
//     properties: {
//       id: {
//         type: 'keyword'
//       }
//     }
//   },
//   date: {
//     type: 'date'
//   }
// }

// function extractType(properties, type, path = []) {
//   return Object.entries(properties).reduce(
//     (result, [k, v]) => {
//       if (typeof v === 'object')
//         return [...extractType(v, type, [...path, k]), ...result]

//       if (v === type)
//         return [path.filter(x => x !== 'properties').join('.'), ...result]

//       return result
//     },
//     []
//   )
// }

function extractFieldsWithType(mapping, type, path = []) {
  return Object.entries(mapping).reduce(
    (result, [k, v]) => {
      if (typeof v === 'object')
        return [...extractFieldsWithType(v, type, [...path, k]), ...result]

      if (v === type)
        return [path.filter(x => x !== 'properties').join('.'), ...result]

      return result
    },
    []
  )
}

console.log(extractFieldsWithType(properties, 'keyword'))
