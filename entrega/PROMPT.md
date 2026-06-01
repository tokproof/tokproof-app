# Prompt — Selector de bloques con preview flotante (Tokproof)

> Pega este prompt en tu asistente de código (Claude Code, Cursor, etc.) o úsalo como
> spec para tu equipo. Está pensado para integrarse en un editor que YA existe.

---

## Contexto

Tengo un editor de páginas tipo Shopify Theme Editor (sidebar + canvas con el móvil en
el centro). Quiero mejorar **únicamente el flujo de AÑADIR UN BLOQUE NUEVO**.

**MUY IMPORTANTE — ámbito del cambio:**
Aplica esta UX **solo** cuando el usuario abre el selector de bloques para insertar uno
nuevo (al pulsar el botón “+ Añadir bloque” del canvas o el botón global de “Bloques”).
**No** cambies el comportamiento de los bloques que ya están colocados en la página:
esos conservan sus propios controles (arrastrar, ocultar, duplicar, borrar) y NO deben
mostrar este popover de preview.

Disparador (trigger): el panel/popover de selección solo se monta cuando
`isAddingBlock === true`. Al cerrar el panel o tras insertar el bloque, vuelve a
`false` y todo el comportamiento de hover/preview deja de existir.

## Comportamiento de cada card del selector

- **Sin botones dentro de la card.** Solo: thumbnail + nombre + badge (Free / Pro /
  Próximamente) + descripción de 2 líneas.
- **Hover sobre la card** → aparece automáticamente un **popover de preview** (con un
  pequeño delay ~140 ms al salir para evitar parpadeos).
- **Click en la card** → **fija** el popover abierto (estado `pinned`).
- **Click fuera** (ni en una card ni en el popover) → cierra el popover fijado.
- Mientras el popover está activo, la card correspondiente queda **resaltada**.

## Popover de preview (mantener el diseño actual)

Contenido, en este orden:
1. Nombre del bloque + badge Free / Pro / Próximamente.
2. Mockup / preview visual del bloque.
3. Descripción corta.
4. Chips “Ideal para”.
5. **Un único CTA: “+ Añadir bloque”** (sin CTAs duplicados).
   - Si el bloque es `Próximamente`, el CTA se sustituye por “Disponible pronto”
     (deshabilitado).

Reglas del popover:
- `position: fixed` — **nunca debe desplazar el layout**. Se ancla a la derecha del
  panel de bloques, alineado verticalmente con la card en hover, y se hace `clamp`
  dentro del viewport.
- Animación de entrada sutil (fade + slide ~6 px, 160 ms).
- Al insertar: el CTA llama a `onAddBlock(blockId)`, que añade la sección al final del
  canvas y cierra el popover + el selector.

## Estados a soportar

1. **Normal** — selector abierto, ninguna preview.
2. **Hover** — preview flotante visible + card resaltada.
3. **Pinned** — preview fijada tras click; se cierra con la X o con click fuera.

## Estilo visual (identidad Tokproof)

- Fondo del canvas: `#FBF9FC`. Paneles y cards: blanco.
- Morado primario: `#7c3aed` (gradiente CTA `#8b5cf6 → #7c3aed`).
- Acento rosa: `#e0398d`.
- Badges: Pro `#ede7fd / #7c3aed` (+ icono candado), Free `#dcfce7 / #16a34a`,
  Próximamente `#eef0f3 / #8b8f98`.
- Cards: `border-radius: 16px`, borde `1.5px var(--line)`, sombra base muy sutil.
- **Hover de card:** borde morado suave (`#d9c9f7`), sombra ligera
  (`0 9px 22px rgba(124,58,237,.11)`) y micro-elevación (`translateY(-1px)`).
- Popover: `border-radius: 18px`, sombra
  `0 24px 60px -18px rgba(60,30,90,.32)`, puntero/flecha hacia la card.

## Referencias de UX

Shopify Theme Editor, Framer y Webflow: el usuario **ve el bloque → pasa el ratón →
ve la preview → pulsa añadir**. Lo más simple posible, cero fricción.

## Criterios de aceptación

- [ ] El popover solo aparece dentro del flujo de “añadir bloque nuevo”.
- [ ] Las cards no tienen botones.
- [ ] Hover muestra preview; click fija; click fuera cierra.
- [ ] Un solo CTA “Añadir bloque” (o “Disponible pronto” si es Próximamente).
- [ ] El popover nunca mueve el layout.
- [ ] Los bloques ya colocados en la página NO muestran este popover y conservan sus
      controles (drag / ocultar / duplicar / borrar).
