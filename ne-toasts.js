export class NeToasts extends HTMLElement {
  #count = 0;

  constructor() {
    super();
    const style = document.createRange().createContextualFragment(styles());
    document.head.append(style);
  }

  addToast = (ev) => {
    this.#count++;
    const ttl = ev.detail.ttl || 5000;
    const text = `${this.#count} ${ev.detail.text ?? "a toast"}`;

    const toast = getNode(template({ text, ttl, count: this.#count }));

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.appendChild(toast);
      });
    } else {
      this.appendChild(toast);
    }

    setTimeout(() => {
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          toast.remove();
        });
      } else {
        toast.remove();
      }
    }, ttl);
  };

  connectedCallback() {
    this.setAttribute("popover", "manual");
    this.showPopover();
    document.body.addEventListener("ne-add-toast", this.addToast);
  }
  disconnectedCallback() {
    document.body.removeEventListener("ne-add-toast", this.addToast);
  }
}

customElements.define("ne-toasts", NeToasts);

function getNode(str) {
  return new DOMParser().parseFromString(str, "text/html").body.childNodes[0];
}

function template({ text, ttl, count }) {
  return String.raw`<output style="--ttl: ${ttl};">
  <div class="toast-content">${text}</div>
  <div class="border-wrapper">
    <div class="border-element"></div>
  </div>
</output>`;
}

function styles() {
  return String.raw`<style>
  @keyframes bg-spin {
    to {
      --percent: 110%;
    }
  }
  
  @property --cqi {
    syntax: "<length>";
    inherits: false;
    initial-value: 0px;
  }
  
  @property --cqb {
    syntax: "<length>";
    inherits: false;
    initial-value: 0px;
  }

  @property --percent {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 0%;
  }
  
  ne-toasts:popover-open {
    /* position in latin languages top right corner */
    inset-block: 1rem auto;
    inset-inline: auto 1rem;

    max-width: 300px;

    display: flex;
    flex-direction: column-reverse;
    align-items: end;
    gap: 1rem;

    background: none;
    border: 0;
    padding: 5px;

    &:empty() {
      padding: 0px;
    }

    pointer-events: none; /* ability to click through this container  */

    & > * {
      pointer-events: all; /* ability to interact with actual toasts  */
    }

    &::backdrop {
      display: none;
    }

    output {
      position: relative;
    }
  }
  .toast-content {
    background: #0007;
    background-clip: padding-box;
    backdrop-filter: blur(3px);
    border: 5px solid transparent;
    border-radius: 2rem;
    padding: 2rem;
  }
  .border-wrapper {
    position: absolute;
    inset: 0;
    container-type: size;
  }
  .border-element {
    position: absolute;
    inset: 0;
    border: 5px solid transparent;
    border-radius: 2rem;

    --cqi: -100cqi; /* minus to get the angle pointing to the top left corner */
    --cqb: 100cqb;
    --angle: atan2(var(--cqi), var(--cqb));
    --percent: 0%; /* animation starting point */
    --color: oklch(71.76% 0.3493 334.58);

    background: conic-gradient(
        from var(--angle),
        transparent,
        transparent calc((var(--percent) - 5%)),
        var(--color) var(--percent)
      )
      border-box;
    mask: conic-gradient(#0000 0 0) subtract padding-box,
      conic-gradient(#000 0 0);

    animation: bg-spin calc(var(--ttl) * 1ms) linear infinite;
  }
  
</style>`;
}
