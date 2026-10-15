"use strict";

// Dados do formulario sao convertidos em numeros, nunca executados como codigo.
function calcularTotal(valor, quantidade) {
  const preco = Number(valor);
  const unidades = Number(quantidade);
  if (!Number.isFinite(preco) || !Number.isInteger(unidades) || preco < 0 || unidades < 1) {
    throw new Error("Informe um valor positivo e uma quantidade inteira maior que zero.");
  }
  return preco * unidades;
}

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const resultado = document.querySelector("output");
  try {
    const total = calcularTotal(document.querySelector("#valor").value, document.querySelector("#quantidade").value);
    resultado.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch (error) {
    resultado.textContent = error.message;
  }
});
