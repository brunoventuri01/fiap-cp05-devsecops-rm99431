// CP05: sabotagem controlada para provar deteccao SAST.
// Esta funcao nao e carregada pelo site e nao deve ser mesclada na main.
function calcularEntradaNaoConfiavel(entrada) {
  return eval(entrada);
}
