
export const
    DOCUMENT        =  1,
    PARAGRAPH       =  2,
    HEADING_1       =  3,
    HEADING_2       =  4,
    HEADING_3       =  5,
    HEADING_4       =  6,
    HEADING_5       =  7,
    HEADING_6       =  8,
    CODE_BLOCK      =  9,
    CODE_FENCE      = 10,
    CODE_INLINE     = 11,
    ITALIC_AST      = 12,
    ITALIC_UND      = 13,
    STRONG_AST      = 14,
    STRONG_UND      = 15,
    STRIKE          = 16,
    LINK            = 17,
    RAW_URL         = 18,
    IMAGE           = 19,
    BLOCKQUOTE      = 20,
    LINE_BREAK      = 21,
    RULE            = 22,
    LIST_UNORDERED  = 23,
    LIST_ORDERED    = 24,
    LIST_ITEM       = 25,
    CHECKBOX        = 26,
    TABLE           = 27,
    TABLE_ROW       = 28,
    TABLE_CELL      = 29,
    EQUATION_BLOCK  = 30,
    EQUATION_INLINE = 31,
    NEWLINE         = 101,
    MAYBE_URL       = 102,
    MAYBE_TASK      = 103,
    MAYBE_BR        = 104,
    MAYBE_EQ_BLOCK  = 105;

export const
    HREF    = 0,
    SRC     = 1,
    LANG    = 2,
    CHECKED = 3,
    START   = 4,
    TITLE   = 5,
    ALIGN   = 6;

export const ATTRIBUTE_NAMES = ["href", "src", "lang", "checked", "start", "title", "align"];

export function FastMDParser(renderer: Renderer, options?: ParserOptions): Parser;

export interface ParserOptions {
    // 输入中的每一个换行符都会换行，而不需要两个空格在末尾。
    preserveLineBreaks?: boolean;
    // 允许在行内渲染 $$ eq $$ 或 \[ eq \]
    parseInlineEquationBlock?: boolean;
    // 解析代码块（单纯通过缩进而不是```language开始的的纯文本块，后者叫CodeFence）
    parseCodeBlock: boolean;
}

export interface Parser {
    // Text to be added to the last token in the next flush
    text: string;
    // Characters for identifying tokens
    pending: string;
    // Current token and it's parents (a slice of a tree)
    tokens: Array<number>;
    // Last token in the tree
    token: number;

    // list indent count
    spaces: Array<number>;
    indent: string;
    indent_len: number;

    // For {@link CODE_FENCE} parsing
    fence_start: number;
    // For {@link CODE_FENCE} parsing
    fence_line: number;

    // For Blockquote parsing
    blockquote_idx: number;

    // For horizontal rule parsing
    hr_char: string;
    // For horizontal rule parsing
    hr_chars: number;

    table_state: number;
    table_align?: ('left' | 'center' | 'right')[];
    td_index?: number;

    // 上一行是否以两个空格或换行符结束
    end_with_space?: boolean;
    // 本行忽略的tokenid
    ignored?: Set<number>;
    // 添加到textContent的最后一个字符
    prev_text?: string;
    // 公式是否使用美元
    eq_dollar?: string;

    options: ParserOptions;
    renderer: Renderer;

    // 增量渲染
    write(chunk: string): void;
    // 结束
    end(): void;
}

export interface Renderer {
    add_token(token_id: number, parser: Parser): void;
    // 对行内元素的乐观（贪婪）预测失败，需要重新转换为文本
    end_token(token_id: number, parser: Parser, undo?: boolean): string;

    set_attr(attr_id: number, value: string): void;
    add_text(value: string, parser: Parser): void;
}
