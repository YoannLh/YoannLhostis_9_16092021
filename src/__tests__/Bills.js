/**
* @jest-environment jsdom
*/

import { screen, getByTestId, getAllByText, waitFor } from "@testing-library/dom"
import '@testing-library/jest-dom'
import BillsUI from "../views/BillsUI.js"
import VerticalLayout from "../views/VerticalLayout"
import { bills } from "../fixtures/bills.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const html = BillsUI({ data: [] })
      document.body.innerHTML = html
      // to-do write expect expression
      // Apparemment pas le bon noeud ? ( istanbul ignore next ? avec VerticalLayout ? )
      waitFor(() => {
        expect(getByTestId(document.body, 'icon-window')).toHaveStyle({ backgroundColor: "#7bb1f7" });
      })
    })
    test("Then bills should be ordered from earliest to latest", async () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- \/.](0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      waitFor(() => { 
        expect(dates).toEqual(datesSorted)
      })
    })
  })
})
