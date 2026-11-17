# 🎨 SiteCanvas - Construtor Low-Code Interativo

> Uma aplicação web nativa e leve (Low-Code) que permite a construção de interfaces através de blocos visuais, manipulando o DOM e gerando código estruturado em tempo real sem a dependência de frameworks.

![Frontend](https://img.shields.io/badge/Frontend-Vanilla_JS-yellow)
![Styling](https://img.shields.io/badge/Styling-CSS3_&_Tailwind-blue)
![Markup](https://img.shields.io/badge/Markup-HTML5-orange)

## 📋 O Problema e o Impacto

O SiteCanvas foi inicialmente concebido e aplicado como a ferramenta central em oficinas de extensão universitária voltadas para alunos do Ensino Médio. 

O principal gargalo técnico nessas capacitações era a curva de aprendizado inicial da programação e a abstração de como o código se converte em interface gráfica. A solução foi construir um ambiente de prototipação visual que atua como uma ponte educativa, reduzindo a barreira de entrada e focando no letramento digital e impacto social, enquanto o motor javascript trata de orquestrar a lógica por trás dos panos.

---

## 🧠 Arquitetura e Engenharia do Sistema

Este projeto comprova o domínio na web nativa. A estrutura não faz uso de Virtual DOM (como React ou Vue), operando diretamente na árvore de elementos (Document Object Model) com foco em desempenho e controle absoluto da renderização.

*   **Manipulação Nata do DOM (Vanilla JS):** Lógica arquitetada sem abstrações extras. O gerenciamento do estado dos componentes, do design da página e do histórico (Undo/Redo) ocorre inteiramente por javascript puro (ES6+).
*   **Editor "Drag and Drop":** Integração otimizada com a biblioteca leve `SortableJS` para fluidez ao reposicionar blocos de construção.
*   **Geração Dinâmica de Código:** O motor não cria apenas a interface visual, mas escreve e exporta o código (HTML e CSS estruturado) de forma limpa, baseada nos atributos injetados em cada objeto, entregando um arquivo real ao usuário (`blob` de exportação).
*   **Gerenciamento de Estado Persistente:** Utilização do `localStorage` com controle e tratamento de erros (try/catch) visando proteger o limite de armazenamento do navegador (fallback/safety limits na inserção pesada de imagens em `base64`).

---

## 🛠️ Stack Tecnológica

| Camada / Função | Tecnologia | Aplicação Prática |
| :--- | :--- | :--- |
| **Lógica do Aplicativo** | JavaScript (ES6+) | Engine central, manipulação do DOM e Estado (History) |
| **Estrutura Base** | HTML5 | Arquitetura semântica e suporte a modais nativos |
| **Estilização UI** | CSS3 & Tailwind | Tailwind para os painéis do editor, CSS Customizado para o Canva final |
| **Funcionalidades** | SortableJS | Motor físico para arrastar e soltar (Drag and Drop) |
| **Ícones** | Feather Icons | Conjunto de vetores para ferramentas visuais limpas |

---

## 🚀 Como Executar Localmente

Sendo uma aplicação estática (Client-Side), não há necessidade de levantar serviços backend complexos ou usar containers.

1. Clone o repositório em sua máquina local:
```bash
git clone [https://github.com/SeuUsuario/SiteCanvas.git](https://github.com/SeuUsuario/SiteCanvas.git)
```
> 💡Projeto já hospedado para se divertirem à vontade!
