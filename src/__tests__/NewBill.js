/**
* @jest-environment jsdom
*/

import { getByTestId, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { readyException } from "jquery"
import { data } from "../__mocks__/firebase"

describe("Test format file in input form new Bill", () => {
  test("format of file should be .jpg, jpeg ou .png", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html
    //const file = document.querySelector(`input[data-testid="file"]`)
    //to-do write assertion
    waitFor(() => {
      expect(getByTestId(document.body, 'file')).toMatch(/.jpg$|.jpeg$|.png$|/);
    })
  })
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form appears", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
})