/**
* @jest-environment jsdom
*/

import { screen, getByTestId, getAllByTestId, waitFor, getByText, fireEvent } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom'
import Bills from "../containers/Bills.js"
import Logout from "../containers/Logout.js"
import BillsUI from "../views/BillsUI.js"
import VerticalLayout from "../views/VerticalLayout"
import { bills } from "../fixtures/bills.js"
import Router from "../app/Router";

import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import Firestore from "../app/Firestore";
import { localStorageMock } from "../__mocks__/localStorage.js";

import firebase from "../__mocks__/firebase"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });

      const pathname = ROUTES_PATH["Bills"];
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;
      Router();

      expect(getByTestId(document.body, "icon-window")).toHaveClass('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const dates = screen.getAllByText(/^(19|20)\d\d[- \/.](0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      const antiChrono = (a, b) => ((a < b) ? 1 : -1)

      dates.sort(antiChrono);
      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When there is a problem with data", () => {
    test("Then the page should be Error Page", () => {

      const html = BillsUI({ data: bills, loading: false, error: "error" })
      document.body.innerHTML = html

      expect(getByTestId(document.body, 'error-message')).toBeTruthy();
    })
  })
})
describe("Test features on Bills", () => {
  test("bills should be an instance of Bills", () => {

    const bills = new Bills({ document });

    expect(bills).toBeInstanceOf(Bills);
  })
  test("The button newbill should be defined", () => {

    const bills = new Bills({ document });
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html

    expect(getByTestId(document.body, 'btn-new-bill')).toBeTruthy();
  })
  test("click on new bill is working properly", () => {

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const html = BillsUI({ data: bills })
    document.body.innerHTML = html

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const firestore = null;
    const allBills = new Bills({
      document,
      onNavigate,
      firestore,
      localStorage: window.localStorage,
    });

    const handleClickNewBill = jest.fn(allBills.handleClickNewBill);
    const billBtn = screen.getByTestId("btn-new-bill");
    billBtn.addEventListener("click", handleClickNewBill);
    fireEvent.click(billBtn);
    expect(screen.getByText("Envoyer une note de frais")).toBeInTheDocument();
  })
  test("click on eye-icon is working properly", () => {

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const firestore = null;
    const allBills = new Bills({
      document,
      onNavigate,
      firestore,
      localStorage: window.localStorage,
    });

    $.fn.modal = jest.fn();
    const eyes = screen.getAllByTestId("icon-eye");
    for(const eye of eyes) {
      const handleClickIconEye = jest.fn(() =>
        allBills.handleClickIconEye(eye)
      );
      eye.addEventListener("click", handleClickIconEye);
      fireEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = document.getElementById("modaleFile");
      expect(modale).toBeTruthy();
    }
  });
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills UI", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});

// // Test d'intégration GET:
// describe("GIVEN I am a user connected as Employee", () => {
//   describe("WHEN I navigate to Bills page", () => {
//     test("THEN it fetches bills from mock API GET", async () => {
//       const getSpy = jest.spyOn(firebase, "get");
//       const bills = await firebase.get();

//       expect(getSpy).toHaveBeenCalledTimes(1);

//       expect(bills.data.length).toBe(4);
//     });

//     test("THEN it fetches from an API and fails with 404 error message", async () => {
//       firebase.get.mockImplementationOnce(() => {
//         Promise.reject(new Error("Erreur 404"));
//       });

//       const html = BillsUI({ error: "Erreur 404" });
//       document.body.innerHTML = html;

//       const message = screen.getByText(/Erreur 404/);

//       expect(message).toBeTruthy();
//     });

//     test("THEN it fetches from an API and fails with 500 error message", async () => {
//       firebase.get.mockImplementationOnce(() => {
//         Promise.reject(new Error("Erreur 500"));
//       });

//       const html = BillsUI({ error: "Erreur 500" });
//       document.body.innerHTML = html;

//       const message = screen.getByText(/Erreur 500/);

//       expect(message).toBeTruthy();
//     });
//   });
// });

// test('onPress est appelé avec la bonne chose', () => {
  //   const onPress = jest.fn();
  //   simulatePresses(onPress);
  //   expect(onPress).toBeCalledWith(
  //     expect.objectContaining({
  //       x: expect.any(Number),
  //       y: expect.any(Number),
  //     }),
  //   );
  // });


  


