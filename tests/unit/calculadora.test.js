const calculadora = require("../../models/calculdora.js");

test("somar 2 + 2 deveria retornar 4", () => {
  expect(calculadora.somar(2, 2)).toBe(4);
});

test("somar 100 + 5 deveria retornar 105", () => {
  expect(calculadora.somar(100, 5)).toBe(105);
});

test("somar Banana + 100 deveria retornar Erro", () => {
  expect(calculadora.somar("Banana", 100)).toBe("Error");
});

test("somar 100 + Banana deveria retornar Erro", () => {
  expect(calculadora.somar(100, "Banana")).toBe("Error");
});
