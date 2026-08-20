# ============================================================
# NOVAGRID AI FIXER
# ============================================================

import re


def generate_fix(old_field, new_field, old_code):
    if old_field == new_field:
        return old_code

    new_code = old_code
    replacements = 0

    # 1. Bracket: var["field"] / var['field']
    for q in ['"', "'"]:
        old_p = f'{q}{old_field}{q}'
        new_p = f'{q}{new_field}{q}'
        if old_p in new_code:
            new_code = new_code.replace(old_p, new_p)
            replacements += 1

    # 2. Dict key: "field": / 'field':
    for q in ['"', "'"]:
        for s in [': ', ':']:
            old_p = f'{q}{old_field}{q}{s}'
            new_p = f'{q}{new_field}{q}{s}'
            if old_p in new_code:
                new_code = new_code.replace(old_p, new_p)
                replacements += 1

    # 3. Dot notation: var.field
    dot = re.compile(r'(\w+)\.' + re.escape(old_field) + r'(?=\s|[,)\]}:]|$)')
    if dot.search(new_code):
        new_code = dot.sub(rf'\1.{new_field}', new_code)
        replacements += 1

    # 4. Keyword arg: field=value
    kwarg = re.compile(r'(?<!\w)' + re.escape(old_field) + r'\s*=')
    if kwarg.search(new_code):
        new_code = kwarg.sub(f'{new_field}=', new_code)
        replacements += 1

    # 5. .get("field")
    for q in ['"', "'"]:
        old_g = f'.get({q}{old_field}{q}'
        new_g = f'.get({q}{new_field}{q}'
        if old_g in new_code:
            new_code = new_code.replace(old_g, new_g)
            replacements += 1

    # 6. Interpolation: {field} or ${field}
    for prefix in ['', '$']:
        old_i = f'{prefix}{{{old_field}}}'
        new_i = f'{prefix}{{{new_field}}}'
        if old_i in new_code:
            new_code = new_code.replace(old_i, new_i)
            replacements += 1

    # 7. Generic fallback
    if replacements == 0 and old_field in new_code:
        new_code = new_code.replace(old_field, new_field)
        replacements = 1

    if replacements > 0:
        return new_code

    return f"# TODO: Replace '{old_field}' with '{new_field}' manually.\n{old_code}"
