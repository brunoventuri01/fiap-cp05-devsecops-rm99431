# CP05 - Pipeline DevSecOps completo

**Aluno:** Bruno Venturi Lopes Vieira  
**RM:** 99431  
**Disciplina:** DevSecOps and Cloud Computing - FIAP

Site estatico com calculadora segura, Dockerfile e pipeline de seguranca executado no GitHub Actions. Nenhuma instalacao local e necessaria: os arquivos e commits sao administrados pelo navegador e Docker roda no runner hospedado pelo GitHub.

## Pipeline

O arquivo `.github/workflows/security.yml` dispara em `push`, `pull_request` e manualmente. Existem exatamente tres jobs independentes:

| Job | Escopo | Criterio de bloqueio |
| --- | --- | --- |
| gitleaks | Historico completo alcancavel a partir de HEAD | Segredo detectado, exit code 1 |
| semgrep | Codigo JavaScript/TypeScript | Chamada a eval(), regra local cp05-no-eval, --error |
| trivy | Imagem Docker construida neste commit | CVE CRITICAL, --exit-code 1, sem ignorar vulnerabilidades sem correcao |

Cada job registra data UTC, repositorio, ator, referencia e SHA, e salva seu relatorio como artifact mesmo se o scanner bloquear a execucao. Falhas nao usam `continue-on-error`. O Trivy tambem valida o site com um teste HTTP no container. O workflow tem permissao somente de leitura do codigo e nao publica imagens nem implanta o site.

Gitleaks e Trivy usam binarios de releases oficiais com versoes fixadas e verificacao de SHA-256 a partir do arquivo de checksums oficial. Semgrep usa uma versao fixada do pacote oficial. As regras ficam no repositorio, sem exigir conta ou token Semgrep.

## Sabotagens controladas

As branches de prova partem da main limpa e nao sao mescladas:

- `prova-gitleaks`: commit contendo exclusivamente uma credencial artificial, sem acesso a nenhum servico. Deve falhar no Gitleaks.
- `prova-semgrep`: codigo que chama eval() sobre entrada. Deve falhar no Semgrep.
- `prova-trivy`: Dockerfile usando imagem antiga. Deve falhar se o banco atualizado do Trivy identificar CVEs CRITICAL.

A main permanece sem as sabotagens e deve ter os tres jobs aprovados. Manter as provas fora da main preserva o historico limpo sem apagar evidencias nem enfraquecer o scanner. Remover um segredo real apenas do arquivo nao o retira do historico: exige revogar a credencial e tratar o incidente.

## Evidencias reais - 14/10/2026 (America/Sao_Paulo)

| Execucao | Branch | Resultado observado | Link |
| --- | --- | --- | --- |
| #2 | main | Os tres jobs aprovados | [Actions #2](https://github.com/brunoventuri01/fiap-cp05-devsecops-rm99431/actions/runs/38664270612) |
| #3 | prova-gitleaks | 1 segredo falso, generic-api-key, segredo-falso.env:2, exit 1 | [Actions #3](https://github.com/brunoventuri01/fiap-cp05-devsecops-rm99431/actions/runs/38664309428) |
| #4 | prova-semgrep | 1 achado cp05-no-eval, calculadora-vulneravel.js:4, exit 1 | [Actions #4](https://github.com/brunoventuri01/fiap-cp05-devsecops-rm99431/actions/runs/38664372164) |
| #5 | prova-trivy | 42 achados CRITICAL em nginx:1.20.0 / Debian 10.9, exit 1 | [Actions #5](https://github.com/brunoventuri01/fiap-cp05-devsecops-rm99431/actions/runs/38664423596) |

As execucoes #3, #4 e #5 falharam exclusivamente no scanner sabotado. Os outros dois jobs passaram em cada prova. Exemplos do Trivy: CVE-2022-32221 (curl), CVE-2021-3711 (OpenSSL) e CVE-2022-37434 (zlib). O total 42 conta achados por pacote, nao necessariamente 42 CVEs unicos.

A execucao #1 foi uma tentativa inicial com falhas de ambiente (dependencia pkg_resources e inicializacao HTTP). A execucao #2 resolveu essas falhas com setuptools fixado e tentativas HTTP limitadas. A #1 nao e usada como evidencia de deteccao de vulnerabilidades. Os avisos de Node.js 20 nas Actions nao impediram as execucoes, pois o runner as executou com Node.js 24.

## Reproducao pelo navegador

1. Abra Actions > Security Pipeline para consultar os resultados e artifacts.
2. Para repetir um teste, abra a branch correspondente e use Run workflow.
3. O scan deve falhar pela deteccao indicada, nao por erro de instalacao ou sintaxe.
4. Consulte o PDF de entrega para os prints reais, SHAs, horarios e explicacao das barreiras.

## Limites

O pipeline marca a execucao como falha quando encontra um problema. A configuracao de regras de protecao para impedir merge automaticamente e uma camada separada. Este projeto nao afirma que um commit foi rejeitado pelo GitHub antes de ser gravado.

Um scan limpo significa ausencia de achados no escopo e na base consultada, nao ausencia absoluta de risco. A regra Semgrep deste checkpoint cobre eval() e nao substitui um conjunto amplo de regras SAST. O Trivy usa uma base que muda com a publicacao de novos CVEs.

## Fontes oficiais

- https://github.com/gitleaks/gitleaks
- https://semgrep.dev/docs/semgrep-ci/sample-ci-configs
- https://semgrep.dev/docs/writing-rules/rule-syntax
- https://trivy.dev/docs/latest/guide/configuration/others/
- https://github.com/aquasecurity/trivy/discussions/10425
