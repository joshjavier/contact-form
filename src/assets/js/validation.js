import * as v from './valibot.js'

// Define field schemas
const TextSchema = v.pipe(v.string(), v.nonEmpty('This field is required'))
const EmailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('This field is required'),
  v.email('Please enter a valid email address')
)
const QuerySchema = v.pipe(
  v.string(),
  v.nonEmpty('Please select a query type'),
  v.picklist(['general', 'support'])
)
const ConsentSchema = v.literal(true, 'To submit this form, please consent to being contacted')

// Define form schema
const ContactSchema = v.object({
  firstName: TextSchema,
  lastName: TextSchema,
  email: EmailSchema,
  query: QuerySchema,
  message: TextSchema,
  consent: ConsentSchema
})

// Element references

/** @type {HTMLFormElement} form - The form element */
const form = document.querySelector('[data-js-hook="form"]')

const {
  firstName,
  lastName,
  email,
  query,
  message,
  consent
} = form.elements

/** @type {HTMLFieldSetElement} */
const radioFieldset = [...form.elements].find(el => el.tagName === 'FIELDSET')

/** @type {Array} errors - The array where form errors are collected */
let errors = []

/**
 * Binds instant and afterward validations to a form field.
 * @param {HTMLElement} elField
 * @param {Function} validateFn
 * @param {object} schema
 */
function validateField(elField, schema, validateFn) {
  if (!validateFn) {
    validateFn = (el, schema, opts) => {
      const isCheckbox = el.type === 'checkbox'
      const input = isCheckbox ? el.checked : el.value
      const { success, issues } = v.safeParse(schema, input)
      const errorMessage = issues ? issues[0].message : null
      updateFieldDOM(el, success, errorMessage, opts)
    }
  }

  let touched = false

  elField.addEventListener('change', event => {
    touched = true
    if (elField.type === 'checkbox') {
      validateFn(event.target, schema, { live: true })
    }
  })

  elField.addEventListener('keyup', event => {
    validateFn(event.target, schema, { removeOnly: true })
  })

  elField.addEventListener('blur', event => {
    if (!touched) return
    if (elField.type !== 'checkbox') {
      validateFn(event.target, schema, { live: true })
    }
  })
}

function validateFieldset(elFieldset, validateFn) {
  if (!validateFn) {
    validateFn = (el, opts) => {
      updateFieldDOM(el, true, null, opts)
    }
  }

  const radios = elFieldset.querySelectorAll('input[type="radio"]')

  radios.forEach(radio => {
    radio.addEventListener('change', event => {
      console.log('radio change event')
      validateFn(elFieldset, { removeOnly: true })
    })
  });
}

/**
 * Updates the DOM based on the validity of a field.
 * @param {HTMLElement} el          - The input element being validated
 * @param {boolean} isValid         - Whether the input element is valid
 * @param {string} errorMessage     - The string to display on the error alert
 * @param {Object} [opts]
 * @param {boolean} opts.live       - Controls the aria-live attribute of the error alert
 * @param {boolean} opts.removeOnly - Only update the DOM when removing error indicators
 */
function updateFieldDOM(el, isValid, errorMessage, opts) {
  const removeOnly = opts?.removeOnly
  const isLive = opts?.live
  const elField = el.closest('.field')
  const elError = elField.querySelector('.error')

  if (isValid) {
    el.removeAttribute('aria-invalid')
    elError.textContent = ''
  } else if (!removeOnly) {
    el.setAttribute('aria-invalid', 'true')
    elError.setAttribute('aria-live', isLive ? 'assertive' : 'off')
    elError.textContent = errorMessage
  }
}

// Bind instant and afterward validations to form fields
validateField(firstName, TextSchema)
validateField(lastName, TextSchema)
validateField(email, EmailSchema)
validateField(message, TextSchema)
validateField(consent, ConsentSchema)

// For radio buttons, bind validations to the parent fieldset element
validateFieldset(radioFieldset)

// Submit validation
form.addEventListener('submit', event => {
  event.preventDefault()

  const formData = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    query: query.value,
    message: message.value,
    consent: consent.checked
  }
  console.log(formData)

  const result = v.safeParse(ContactSchema, formData, { abortPipeEarly: true })

  if (result.issues) {
    result.issues.forEach(issue => {
      const el = form.elements[issue.path[0].key]

      if (!el?.tagName) {
        updateFieldDOM(radioFieldset, false, 'Please select a query type', { live: true })
      } else {
        updateFieldDOM(el, false, issue.message, { live: true })
      }
    });
  }
})
