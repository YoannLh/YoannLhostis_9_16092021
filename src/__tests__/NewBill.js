/**
* @jest-environment jsdom
*/

import { getByTestId, screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { readyException } from "jquery"
import { data } from "../__mocks__/firebase"
import firebase from "../__mocks__/firebase.js"
import firestore from "../app/Firestore";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the title appears", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    })
    test("Then the form appears", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(getByTestId(document.body, 'form-new-bill')).toBeTruthy();
    })
    test("newBill should be an instance of NewBill", () => {
      const newBill = new NewBill({ document });
      expect(newBill).toBeInstanceOf(NewBill);
    })
  })
})
describe("When I am on NewBill and editing a new bill", () => {
  test("A file is choosen", () => {

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBill = new NewBill({
      document,
      onNavigate,
      firestore : null,
      localStorage: window.localStorage
    });

    const handleChangeFile = jest.fn(newBill.handleChangeFile);
    const inputFile = screen.getByTestId("file");
    inputFile.addEventListener("change", handleChangeFile);
    fireEvent.change(inputFile, {
      target: {
        files: [new File(["image.png"], "image.png", { type: "image/png" })],
      },
    });

    expect(handleChangeFile).toHaveBeenCalled();
    expect(inputFile.files[0].name).toBe("image.png");
  });
  test("Then format of file should be .jpg, .jpeg ou .png", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBill = new NewBill({
      document,
      onNavigate,
      firestore : null,
      localStorage: window.localStorage
    });

    const handleChangeFile = jest.fn(newBill.handleChangeFile);
    const inputFile = screen.getByTestId("file");
    inputFile.addEventListener("change", handleChangeFile);
    fireEvent.change(inputFile, {
      target: {
        files: [new File(["image.png"], "image.png", { type: "image/png" })],
      },
    });

    expect(inputFile.files[0].name).toMatch(/\.png/);

    fireEvent.change(inputFile, {
      target: {
        files: [new File(["image.jpg"], "image.jpg", { type: "image/jpg" })],
      },
    });

    expect(inputFile.files[0].name).toMatch(/\.jpg/);

    fireEvent.change(inputFile, {
      target: {
        files: [new File(["image.jpeg"], "image.jpeg", { type: "image/jpeg" })],
      },
    });

    expect(inputFile.files[0].name).toMatch(/\.jpeg/);

    fireEvent.change(inputFile, {
      target: {
        files: [new File(["image.pdf"], "image.pdf", { type: "image/pdf" })],
      },
    });

    expect(inputFile.files[0].name).not.toMatch(/\.png/);
    expect(inputFile.files[0].name).not.toMatch(/\.jpg/);
    expect(inputFile.files[0].name).not.toMatch(/\.jpeg/);
  })
})
describe("When I am on NewBill and submit a new bill", () => {
  test("the new bill is submitted when i click submit button", () => {

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBill = new NewBill({
      document,
      onNavigate,
      firestore : null,
      localStorage: window.localStorage
    });

    const handleSubmit = jest.fn(newBill.handleSubmit);
    const buttonSubmit = screen.getByTestId("form-new-bill");
    buttonSubmit.addEventListener("submit", handleSubmit);
    fireEvent.submit(buttonSubmit);
    expect(handleSubmit).toHaveBeenCalled();
  });
})

// Test d'intégration POST:
describe("GIVEN I am a user connected as Employee", () => {
  describe("WHEN I navigate to New Bill and post a new bill", () => {
    test("THEN number of bills feteched from mock API GET increases by 1", async () => {
      console.log(firebase);
      const postSpy = jest.spyOn(firebase, "post");
      const billToPost = {
        id: "47qAXb6fIm2zOKkLzMro",
        email: "a@a",
        type: "Hôtel et logement",
        name: "Bill 1 from bills fixture",
        date: "4 Avr. 2004",
        amount: 400,
        pct: 20,
        vat: "80",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        commentary: "séminaire billed",
        status: "pending",
        commentAdmin: "ok",
      };
      const bills = await firebase.post(billToPost);

      expect(postSpy).toHaveBeenCalledTimes(1);

      expect(bills.data.length).toBe(5);
    });

    test("THEN it posts to API and fails with 500 message error on Bills page", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );

      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;

      const message = screen.getByText(/Erreur 500/);

      expect(message).toBeTruthy();
    });
  });
});
