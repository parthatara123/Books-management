let data = [{
    _id: 287365834756834756,
    user: "Iron man",
    userid: 01,
    order: 0001,
    products: [
      {_id: 45356456,
        name: "product 1",
        price: "12",
        product_status: "ACTIVE"
      },{_id: 567678,
        name: "product 2",
        price: "12",
        product_status: "CANCELLED"
      },{_id: 456456456,
        name: "product 3",
        price: "12",
        product_status: "ACTIVE"
      },{_id: 45647756,
        name: "product 4",
        price: "12",
        product_status: "ACTIVE"
      }]
  },
  {
    _id: 287365834756834756,
    user: "Iron man",
    userid: 01,
    order: 0002,
    products: [
      {_id: 45356456,
        name: "product 1",
        price: "12",
        product_status: "ACTIVE"
      },{_id: 567678,
        name: "product 2",
        price: "12",
        product_status: "CANCELLED"
      },{_id: 456456456,
        name: "product 3",
        price: "12",
        product_status: "ACTIVE"
      },{_id: 45647756,
        name: "product 4",
        price: "12",
        product_status: "CANCELLED"
      }]
  }
]
let result = []
for (let i = 0; i < data.length; i++) {
    const element = array[i];
    for (let j = 0; j < element.products.length; j++) {
        const ele = element.products[j];
        if(ele.product_status == 'ACTIVE'){
          result.push(ele)
        }
    }
}

//result array will be answer

// by mongoose queries

let result = await Model.find({_id: userId}, {products:{$in: {product_status:true}}})