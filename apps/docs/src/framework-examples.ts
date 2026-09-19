export const frameworkExamples = `
  <div class="section-heading">
    <div>
      <p class="eyebrow">Framework usage</p>
      <h2 id="frameworks-title">Use the same elements everywhere.</h2>
    </div>
  </div>
  <p class="framework-intro">The package ships standards-based custom elements. Import the registration once, then use the <code>ads-*</code> elements in HTML, React, Vue, or another framework that supports custom elements.</p>
  <div class="framework-grid">
    <article class="framework-card">
      <h3>HTML</h3>
      <p>Use a module script in a bundler or browser setup with an import map.</p>
      <pre><code>import '@a-design-system/components';

&lt;ads-button variant="primary"&gt;Save&lt;/ads-button&gt;</code></pre>
    </article>
    <article class="framework-card">
      <h3>React</h3>
      <p>No React wrapper package is included. Attach DOM event listeners to custom elements when you need typed custom events.</p>
      <pre><code>import '@a-design-system/components';
import { useEffect, useRef } from 'react';

export function SaveButton() {
  const ref = useRef&lt;HTMLElement&gt;(null);
  useEffect(() =&gt; {
    const button = ref.current;
    if (!button) return;
    const onClick = () =&gt; console.log('saved');
    button.addEventListener('click', onClick);
    return () =&gt; button.removeEventListener('click', onClick);
  }, []);
  return &lt;ads-button ref={ref} variant="primary"&gt;Save&lt;/ads-button&gt;;
}</code></pre>
    </article>
    <article class="framework-card">
      <h3>Vue</h3>
      <p>Register <code>ads-</code> as custom elements in the Vue compiler, then use a template ref for DOM events.</p>
      <pre><code>&lt;script setup lang="ts"&gt;
import '@a-design-system/components';
import { ref } from 'vue';

const button = ref&lt;HTMLElement | null&gt;(null);
&lt;/script&gt;

&lt;template&gt;
  &lt;ads-button ref="button" variant="primary"&gt;Save&lt;/ads-button&gt;
&lt;/template&gt;

// vite.config.ts: isCustomElement: tag =&gt; tag.startsWith('ads-')</code></pre>
    </article>
  </div>
  <p class="framework-note"><strong>Adapter status:</strong> the repository currently provides the Web Components package only; React and Vue examples use their native custom-element integration points.</p>
`;
