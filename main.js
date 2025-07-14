// ===== INICIALIZAÇÃO GLOBAL =====
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar ícones Lucide
  window.lucide.createIcons()

  Navigation.init()
  Forms.init()
  ScrollAnimations.init()
  LazyLoading.init()
})

// ===== MÓDULO DE NAVEGAÇÃO =====
const Navigation = {
  init() {
    this.setupSmoothScrolling()
    this.setupActiveSection()
    this.setupMobileMenu()
    this.setupNavbarScroll()
  },

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault()
        const target = document.querySelector(anchor.getAttribute("href"))
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })
  },

  setupActiveSection() {
    const sections = document.querySelectorAll("section[id]")
    const navLinks = document.querySelectorAll(".nav-link")

    const updateActiveSection = () => {
      let current = "home"
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 150
        if (window.scrollY >= sectionTop) {
          current = section.id
        }
      })

      navLinks.forEach((link) => {
        link.classList.remove("active")
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active")
        }
      })
    }

    window.addEventListener("scroll", Utils.throttle(updateActiveSection, 100))
    updateActiveSection()
  },

  setupMobileMenu() {
    const toggle = document.querySelector(".mobile-menu-toggle")
    const menu = document.querySelector(".mobile-menu")
    const navLinks = document.querySelectorAll(".mobile-nav-link")

    if (!toggle || !menu) return

    toggle.addEventListener("click", () => {
      menu.classList.toggle("active")
      toggle.classList.toggle("active")

      // Animar hamburger
      const hamburgers = toggle.querySelectorAll(".hamburger")
      hamburgers.forEach((bar, index) => {
        if (toggle.classList.contains("active")) {
          if (index === 0) bar.style.transform = "rotate(45deg) translate(6px, 6px)"
          if (index === 1) bar.style.opacity = "0"
          if (index === 2) bar.style.transform = "rotate(-45deg) translate(6px, -6px)"
        } else {
          bar.style.transform = "none"
          bar.style.opacity = "1"
        }
      })
    })

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("active")
        toggle.classList.remove("active")

        // Reset hamburger
        const hamburgers = toggle.querySelectorAll(".hamburger")
        hamburgers.forEach((bar) => {
          bar.style.transform = "none"
          bar.style.opacity = "1"
        })
      })
    })

    // Fechar menu com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("active")) {
        menu.classList.remove("active")
        toggle.classList.remove("active")
      }
    })
  },

  setupNavbarScroll() {
    const navbar = document.querySelector(".navbar")

    window.addEventListener(
      "scroll",
      Utils.throttle(() => {
        if (window.scrollY > 50) {
          navbar.style.background = "rgba(26, 22, 17, 0.98)"
          navbar.style.backdropFilter = "blur(25px)"
        } else {
          navbar.style.background = "rgba(26, 22, 17, 0.95)"
          navbar.style.backdropFilter = "blur(20px)"
        }
      }, 16),
    )
  },
}

// ===== MÓDULO DE FORMULÁRIOS =====
const Forms = {
  init() {
    this.setupContactForm()
    this.setupFormValidation()
  },

  setupContactForm() {
    const form = document.getElementById("contactForm")
    if (!form) return

    form.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleContactSubmit(form)
    })
  },

  setupFormValidation() {
    const inputs = document.querySelectorAll("input, textarea, select")

    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        this.validateField(input)
      })

      input.addEventListener("input", () => {
        this.clearFieldError(input)
      })
    })
  },

  validateField(field) {
    const group = field.closest(".input-group")
    const isValid = field.checkValidity() && field.value.trim() !== ""

    if (!isValid && field.hasAttribute("required")) {
      group.classList.add("error")
      field.style.borderColor = "var(--error)"
    } else {
      group.classList.remove("error")
      field.style.borderColor = ""
    }

    return isValid
  },

  clearFieldError(field) {
    const group = field.closest(".input-group")
    group.classList.remove("error")
    field.style.borderColor = ""
  },

  handleContactSubmit(form) {
    const data = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      telefone: document.getElementById("telefone").value,
      empresa: document.getElementById("empresa").value,
      interesse: document.getElementById("interesse").value,
      mensagem: document.getElementById("mensagem").value,
    }

    // Validar formulário
    if (!this.validateForm(data)) {
      this.showToast("Por favor, preencha todos os campos obrigatórios.", "error")
      return
    }

    // Enviar formulário
    this.submitContact(data)
  },

  validateForm(data) {
    const requiredFields = ["nome", "email", "telefone", "interesse"]
    return requiredFields.every((field) => data[field] && data[field].trim() !== "")
  },

  async submitContact(data) {
    try {
      // Estado de carregamento
      const submitBtn = document.querySelector(".btn-submit")
      const originalHTML = submitBtn.innerHTML
      submitBtn.innerHTML = '<span class="btn-text">Enviando...</span>'
      submitBtn.disabled = true

      // Simular chamada API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Criar mensagem WhatsApp
      const message = this.createWhatsAppMessage(data)
      const whatsappUrl = `https://wa.me/5511973933390?text=${encodeURIComponent(message)}`

      // Abrir WhatsApp
      window.open(whatsappUrl, "_blank")

      // Reset formulário
      document.getElementById("contactForm").reset()

      // Mensagem de sucesso
      this.showToast("Mensagem enviada! Redirecionando para o WhatsApp.", "success")

      // Reset botão
      submitBtn.innerHTML = originalHTML
      submitBtn.disabled = false
      window.lucide.createIcons()
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      this.showToast("Erro ao enviar mensagem. Tente novamente.", "error")

      // Reset botão
      const submitBtn = document.querySelector(".btn-submit")
      submitBtn.innerHTML = '<span class="btn-text">Enviar Mensagem</span><i data-lucide="send" class="btn-icon"></i>'
      submitBtn.disabled = false
      window.lucide.createIcons()
    }
  },

  createWhatsAppMessage(data) {
    return `🏗️ *CONTATO - ENG. LUCAS SANTOS*

👤 *Nome:* ${data.nome}
📧 *Email:* ${data.email}
📱 *Telefone:* ${data.telefone}
${data.empresa ? `🏢 *Empresa:* ${data.empresa}` : ""}
🎯 *Interesse:* ${data.interesse}
${data.mensagem ? `💬 *Mensagem:* ${data.mensagem}` : ""}

---
Enviado pelo site institucional`
  },

  showToast(message, type = "success") {
    const toast = document.getElementById("toast")
    if (!toast) return

    toast.textContent = message
    toast.className = `toast ${type} show`

    setTimeout(() => {
      toast.classList.remove("show")
    }, 4000)
  },
}

// ===== MÓDULO DE ANIMAÇÕES =====
const ScrollAnimations = {
  init() {
    this.setupIntersectionObserver()
  },

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1"
            entry.target.style.transform = "translateY(0)"
            entry.target.classList.add("animate-in")
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px",
      },
    )

    // Observar elementos para animação
    const animatedElements = document.querySelectorAll(".section-header, .brand-card, .contact-form, .footer-section")

    animatedElements.forEach((el, index) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(30px)"
      el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`
      observer.observe(el)
    })
  },
}

// ===== MÓDULO DE LAZY LOADING =====
const LazyLoading = {
  init() {
    const images = document.querySelectorAll('img[loading="lazy"]')

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src || img.src
            img.classList.remove("lazy")
            imageObserver.unobserve(img)
          }
        })
      })

      images.forEach((img) => imageObserver.observe(img))
    }
  },
}

// ===== FUNÇÕES UTILITÁRIAS =====
const Utils = {
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  throttle(func, limit) {
    let inThrottle
    return function () {
      const args = arguments
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },
}

// ===== OTIMIZAÇÕES DE PERFORMANCE =====
window.addEventListener(
  "scroll",
  Utils.throttle(() => {
    // Otimizações baseadas em scroll podem ser adicionadas aqui
  }, 16),
)

window.addEventListener(
  "resize",
  Utils.debounce(() => {
    // Lidar com eventos de redimensionamento
    window.lucide.createIcons()
  }, 250),
)

// ===== TRATAMENTO DE ERROS =====
window.addEventListener("error", (e) => {
  console.error("Erro JavaScript:", e.error)
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise Rejeitada:", e.reason)
})

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");

    let data = {};

    // Suporte a JSON e FormData
    if (e.postData && e.postData.type === "application/json") {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    // Validação dos campos obrigatórios
    const camposObrigatorios = ["nome", "email", "telefone"];
    for (let campo of camposObrigatorios) {
      if (!data[campo]) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: `Campo obrigatório faltando: ${campo}`
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    const dataHora = new Date();

    // Inserção na planilha com todos os campos
    sheet.appendRow([
      dataHora.toLocaleString('pt-BR'),
      data.nome,
      data.email,
      data.telefone,
      data.empresa || "Não informado",
      data.interesse || "Não informado",
      data.mensagem || "Nenhuma"
    ]);

    // Envio de e-mail (ajustado com mais dados)
    const mensagem = `
Novo lead - Lucas Santos:

Nome: ${data.nome}
Email: ${data.email}
Telefone: ${data.telefone}
Empresa: ${data.empresa || "Não informado"}
Interesse: ${data.interesse || "Não informado"}
Mensagem: ${data.mensagem || "Nenhuma"}
Data/Hora: ${dataHora.toLocaleString('pt-BR')}
    `.trim();

    GmailApp.sendEmail(
      "guilhermemorientes@gmail.com, rogergmr@gmail.com",
      "Novo Lead - Lucas Santos",
      mensagem,
      { replyTo: data.email }
    );

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("API ativa!").setMimeType(ContentService.MimeType.TEXT);
}
