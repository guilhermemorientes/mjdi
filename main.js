// ===== INICIALIZAÇÃO GLOBAL OTIMIZADA =====
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar ícones apenas uma vez
  if (window.lucide) {
    window.lucide.createIcons()
  }

  // Inicializar módulos
  Navigation.init()
  Forms.init()
  FAQ.init()

  // Lazy loading das animações para melhor performance
  requestIdleCallback(() => {
    ScrollAnimations.init()
  })
})

// ===== MÓDULO DE NAVEGAÇÃO OTIMIZADO =====
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

    const updateActiveSection = Utils.throttle(() => {
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
    }, 100)

    window.addEventListener("scroll", updateActiveSection, { passive: true })
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

        const hamburgers = toggle.querySelectorAll(".hamburger")
        hamburgers.forEach((bar) => {
          bar.style.transform = "none"
          bar.style.opacity = "1"
        })
      })
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("active")) {
        menu.classList.remove("active")
        toggle.classList.remove("active")
      }
    })
  },

  setupNavbarScroll() {
    const navbar = document.querySelector(".navbar")

    const updateNavbar = Utils.throttle(() => {
      if (window.scrollY > 50) {
        navbar.style.background = "rgba(26, 54, 93, 0.98)"
        navbar.style.backdropFilter = "blur(25px)"
      } else {
        navbar.style.background = "rgba(26, 54, 93, 0.9)"
        navbar.style.backdropFilter = "blur(20px)"
      }
    }, 16)

    window.addEventListener("scroll", updateNavbar, { passive: true })
  },
}

// ===== MÓDULO DE FORMULÁRIOS =====
const Forms = {
  init() {
    this.setupContactForm()
    this.setupFormValidation()
  },

  setupContactForm() {
    const form1 = document.getElementById("contactForm")
    const form2 = document.getElementById("contactForm2")

    if (form1) {
      form1.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleContactSubmit(form1, 1)
      })
    }

    if (form2) {
      form2.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleContactSubmit(form2, 2)
      })
    }
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
      field.style.borderColor = "var(--error-red)"
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

  handleContactSubmit(form, formNumber) {
    const suffix = formNumber === 2 ? "2" : ""
    const data = {
      nome: document.getElementById(`nome${suffix}`).value,
      telefone: document.getElementById(`telefone${suffix}`).value,
      email: document.getElementById(`email${suffix}`).value,
      cidade: document.getElementById(`cidade${suffix}`).value,
      servico: document.getElementById(`servico${suffix}`).value,
      mensagem: document.getElementById(`mensagem${suffix}`).value,
    }

    if (!this.validateForm(data)) {
      this.showToast("Por favor, preencha todos os campos obrigatórios.", "error")
      return
    }

    this.submitContact(data, formNumber)
  },

  validateForm(data) {
    const requiredFields = ["nome", "telefone", "cidade", "servico"]
    return requiredFields.every((field) => data[field] && data[field].trim() !== "")
  },

  async submitContact(data, formNumber = 1) {
    try {
      const submitBtn =
        formNumber === 2
          ? document.querySelector("#contactForm2 .btn-submit")
          : document.querySelector("#contactForm .btn-submit")

      const originalHTML = submitBtn.innerHTML
      submitBtn.innerHTML = '<span class="btn-text">Enviando...</span>'
      submitBtn.disabled = true

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const message = this.createWhatsAppMessage(data)
      const whatsappUrl = `https://wa.me/5511971596167?text=${encodeURIComponent(message)}`

      window.open(whatsappUrl, "_blank")

      const formId = formNumber === 2 ? "contactForm2" : "contactForm"
      document.getElementById(formId).reset()

      this.showToast("Mensagem enviada! Redirecionando para o WhatsApp.", "success")

      submitBtn.innerHTML = originalHTML
      submitBtn.disabled = false

      // Recriar ícones apenas se necessário
      if (window.lucide) {
        window.lucide.createIcons()
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      this.showToast("Erro ao enviar mensagem. Tente novamente.", "error")

      const submitBtn =
        formNumber === 2
          ? document.querySelector("#contactForm2 .btn-submit")
          : document.querySelector("#contactForm .btn-submit")

      const buttonText = formNumber === 2 ? "Enviar Solicitação" : "Solicitar Orçamento"
      submitBtn.innerHTML = `<span class="btn-text">${buttonText}</span><i data-lucide="send" class="btn-icon"></i>`
      submitBtn.disabled = false

      if (window.lucide) {
        window.lucide.createIcons()
      }
    }
  },

  createWhatsAppMessage(data) {
    return `🚛 *ORÇAMENTO - MUNCK JUNDIAÍ*

👤 *Nome:* ${data.nome}
📱 *Telefone:* ${data.telefone}
${data.email ? `📧 *Email:* ${data.email}` : ""}
📍 *Cidade:* ${data.cidade}
🔧 *Serviço:* ${data.servico}
${data.mensagem ? `💬 *Detalhes:* ${data.mensagem}` : ""}

---
Solicitação via site oficial`
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

// ===== MÓDULO FAQ =====
const FAQ = {
  init() {
    this.setupFAQToggle()
  },

  setupFAQToggle() {
    const faqQuestions = document.querySelectorAll(".faq-question")

    faqQuestions.forEach((question) => {
      question.addEventListener("click", () => {
        const faqItem = question.closest(".faq-item")
        const isActive = faqItem.classList.contains("active")

        // Fechar todos os outros FAQs
        document.querySelectorAll(".faq-item").forEach((item) => {
          if (item !== faqItem) {
            item.classList.remove("active")
            const otherQuestion = item.querySelector(".faq-question")
            otherQuestion.setAttribute("aria-expanded", "false")
          }
        })

        // Toggle do FAQ atual
        if (isActive) {
          faqItem.classList.remove("active")
          question.setAttribute("aria-expanded", "false")
        } else {
          faqItem.classList.add("active")
          question.setAttribute("aria-expanded", "true")
        }
      })
    })

    // Suporte para teclado
    faqQuestions.forEach((question) => {
      question.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          question.click()
        }
      })
    })
  },
}

// ===== MÓDULO DE ANIMAÇÕES OTIMIZADO =====
const ScrollAnimations = {
  init() {
    // Usar Intersection Observer mais eficiente
    this.setupIntersectionObserver()
  },

  setupIntersectionObserver() {
    // Observer mais simples e performático
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
            // Parar de observar após animar
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    // Aplicar animação via CSS em vez de JS para melhor performance
    const animatedElements = document.querySelectorAll(".diferencial-card, .servico-card, .faq-item")

    animatedElements.forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(20px)"
      el.style.transition = "opacity 0.4s ease, transform 0.4s ease"
      observer.observe(el)
    })
  },
}

// ===== FUNÇÕES UTILITÁRIAS OTIMIZADAS =====
const Utils = {
  throttle(func, limit) {
    let inThrottle
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  debounce(func, wait) {
    let timeout
    return function (...args) {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  },
}

// ===== CSS PARA ANIMAÇÕES =====
const style = document.createElement("style")
style.textContent = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`
document.head.appendChild(style)

// ===== OTIMIZAÇÕES DE PERFORMANCE =====
// Usar passive listeners para scroll
window.addEventListener(
  "scroll",
  Utils.throttle(() => {
    // Scroll otimizado
  }, 16),
  { passive: true },
)

// Debounce resize
window.addEventListener(
  "resize",
  Utils.debounce(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 250),
)

// ===== TRATAMENTO DE ERROS =====
window.addEventListener("error", (e) => {
  console.error("Erro JavaScript:", e.error)
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise Rejeitada:", e.reason)
})
