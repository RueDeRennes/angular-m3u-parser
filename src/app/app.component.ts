/// @type String - The Element separator used. Default '__'.
$bem--sep-elem: '__';
/// @type String - The Modifier separator used. Default '--'.
$bem--sep-mod: '--';
/// @type String - The Modifier Value separator used. Default '-'.
$bem--sep-mod-val: '-';

/// Converts a passed selector value into plain string.
/// @access private
/// @param {String} $s - The selector to be converted.
/// @returns {String}
@function bem--selector-to-string($s) {
    @if $s == null {
        @return '';
    }
    //cast to string
    $s: inspect($s);
    @if str-index($s, '(') {
        // ruby sass => "(selector,)"
        @return str-slice($s, 2, -3);
    } @else {
        // libsass => "selector"
        @return str-slice($s, 1, -1);
    }
}

/// Prepends a dot to the passed BEM selector.
/// @access private
/// @param {String} $x - The BEM selector to prepend a dot to.
/// @returns {String}
/// @example scss - Returns
///   .#{$x}
@function bem--with-dot($x) {
    $first: str-slice($x, 0, 1);
    @return if($first== '.', $x, '.' + $x);
}

/// Converts a key-value map into a modifier string.
/// @access private
/// @param {List} $m - The modifier list to get converted.
/// @returns {String}
@function bem--mod-str($m) {
    @if type-of($m) == 'map' {
        $mm: nth($m, 1);
        @return nth($mm, 1) + $bem--sep-mod-val + nth($mm, 2);
    } @else {
        @return $m;
    }
}

/// Prefixes the block name to an element selector string,
/// with the element separator string used as a divider.
/// @access private
/// @param {String} $b - The block name.
/// @param {String} $e - The element name.
/// @returns {String}
/// @example scss - Returns
///   .block__element
@function bem--elem-str($b, $e) {
    @return $b + $bem--sep-elem + $e;
}

/// Returns a block selector string affixed by the modifier selector,
/// followed by the element selector string.
/// @access private
/// @param {String} $block - The block name.
/// @param {String} $elem - The sub-element name.
/// @param {String} $mod - The modifier name.
/// @returns {String}
/// @example scss - Returns
///   .block--modifier .block__element
@function bem--bem-str($block, $elem, $mod) {
    $elem: if($elem, ' ' + $elem, '');
    @return ($block + $bem--sep-mod + bem--mod-str($mod) + $elem);
}

/// Checks if the element separator string is part of the passed string.
/// @access private
/// @param {String} $x - The string to check.
/// @returns {number|null} Will return the index of the occurance,
/// or null if the element separator name is not part of the passed string.
@function bem--contains-elem($x) {
    // if you set the separators to common strings, this could fail
    @return str-index($x, $bem--sep-elem);
}

/// Checks if the modifier separator string is part of the passed string.
/// @access private
/// @param {String} $x - The string to check.
/// @returns {number|null} Will return the index of the occurance,
/// or null if the modifier separator string is not part of the passed string.
@function bem--contains-mod($x) {
    // if you set the separators to common strings, this could fail
    @return str-index($x, $bem--sep-mod);
}

/// Checks if the passed selector string contains a colon.
/// @access private
/// @param {String} $x - The string to check for colons.
/// @returns {number|null} Will return the index of the occurance,
/// or null if the string does not contain any colons.
@function bem--contains-pseudo($x) {
    @return str-index($x, ':');
}

/// Returns the BEM block-name that generated `$x`. Does not include leading ".".
/// @access private
/// @param {String} $x - The block name.
@function bem--extract-block($x) {
    @if bem--contains-mod($x) {
        @return str-slice($x, 1, str-index($x, $bem--sep-mod)-1);
    } @else if bem--contains-elem($x) {
        @return str-slice($x, 1, str-index($x, $bem--sep-elem)-1);
    } @else if bem--contains-pseudo($x) {
        @return str-slice($x, 1, str-index($x, ':')-1);
    }
    @return $x;
}

/// Returns the first selector of a nested selector string.
/// @access private
/// @param {String} $x - The selector to search for.
/// @returns {String}
@function bem--extract-first-selector($x) {
    $eow: str-index($x, ' ') or -1;
    @return str-slice($x, 1, $eow);
}

/// Generates a full BEM selector.
/// @access public
/// @param {String} $block - Required. A string block name.
/// @param {String|List} $elem - Optional. A sub-element name. If `$mod` is not present, it is
/// joined with $block. If $mod is present, it is nested under `$block--$mod`.
/// @param {String|Map} $mod - Optional. A block modifier.
/// @example scss Include a block
///   @include bem-selector(block); // outputs .block
/// @example scss Include a block and an element
///   @include bem-selector(block, $e:elem); // outputs .block__elem
/// @example scss Include block, element, and element modifier
///   @include bem-selector(block, $e:(elem,emod); // outputs .block__elem-emod
/// @example scss Include block and block modifier
///   @include bem-selector(block, $m:mod) // outputs .block--mod
/// @example scss Include block and modifier value
///   @include bem-selector(block, $m:(mod:val)); // outputs .block--mod-val
/// @example scss Include block modifier followed by block sub-element
///   @include bem-selector(block, $m:mod, $e:elem); // outputs .block--mod .block__elem
@function bem-selector($block, $e: null, $elem: null, $m: null, $mod: null, $mods: null) {
    $block: bem--with-dot($block);
    $elem: $e or $elem;
    // Return early if possible
    $mods: $m or $mod or $mods;
    @if not($elem or $mods) {
        @return $block;
    }
    @if $elem {
        // User passed an element-specific modifier
        @if (type-of($elem) == list) and nth($elem, 2) {
            // For now we don't support multiple elem-mods at once
            @if type-of(nth($elem, 2)) == list {
                @error 'Only one element-modifier allowed.';
            }
            $elem: str-slice(bem-selector(nth($elem, 1), $m: nth($elem, 2)), 2);
        }
        $elem: bem--elem-str($block, $elem);
    }
    @if not $mods {
        @return bem--with-dot($elem);
    }
    @if type-of($mods) != list {
        $mods: ($mods);
    }
    $bemcls: '';
    @for $i from 1 to length($mods) {
        $bemcls: $bemcls + bem--bem-str($block, $elem, nth($mods, $i)) + ', ';
    }
    $bemcls: $bemcls + bem--bem-str($block, $elem, nth($mods, -1));
    @return $bemcls;
}

/// Simply unrolls into a class-selector. The main purpose of using this mixin
/// is to clearly denote the start of a BEM block.
/// @access public
/// @param {String} $block - The block name.
@mixin bem-block($block) {
    @at-root {
        #{bem-selector($block)} {
            @content;
        }
    }
}

/// Unrolls into a proper BEM element selector, depending on the context.
/// Inside just a block, yields a root-level `.block__elem`.
/// Inside a mod or pseudo-selector, yields a nested `.block--mod .block__elem`.
/// If $mod is included, it is appended to the block selector. Multiple
/// $mods are not supported.
/// @access public
/// @param {String} $elem - The sub-element name.
/// @param {String} $m - The modifier name.
/// @param {String} $mod - An alias of `$m`.
@mixin bem-elem($elem, $m: null, $mod: null, $mods: null) {
    $this: bem--selector-to-string(&);
    $block: bem--extract-block($this);
    $first: bem--extract-first-selector($this);
    $nested: bem--contains-pseudo($this) or bem--contains-mod($this);

    $mod: $m or $mod;
    $mx: ();

    @if $this == '' {
        @error 'Detected an Element that is not inside a Block: #{$elem}';
    }

    @if bem--contains-elem($this) {
        @error 'Detected a multi-level nested Element (#{$this} #{$elem})! Bemerald doesn\'t support nested ' + 'elements because they do not have BEM nature (www.getbem.com/faq/#css-nested-elements). ' + 'If you must do it, use a hardcoded selector like &__subsubelem ';
    }

    @if $mods != null and type-of($mods) == 'list' {
        @each $i in $mods {
            $mx: append($mx, #{bem-selector($block, $e: ($elem, $i))});
        }
    }

    @if not($nested) {
        // Normal case, no pseudo-selector present or mod, so no nesting.
        // .block__elem { ... }
        @at-root {
            @if $mods == null {
                #{bem-selector($block, $e: ($elem, $mod))} {
                    @content;
                }
            } @else {
                #{selector-append($mx...)} {
                    @content;
                }
            }
        }
    } @else {
        // pseudo-element or mod present, so we have nesting.
        // .block:active .block__elem { ... }
        // .block--mod .block__elem { ... }
        @at-root {
            $selector: $first + ' ' + bem-selector($block, $e: ($elem, $mod));

            @if $mods == null {
                #{$selector} {
                    @content;
                }
            } @else {
                #{$first} #{selector-append($mx...)} {
                    @content;
                }
            }
        }
    }
}

/// Unrolls into a BEM block-modifier selector.
/// This mixin does not generate element-modifiers, the bem-elem mixin instead.
/// Nesting bem-mod inside a pseudo-selector is not supported, because what
/// that should mean isn't clear.
/// @access public
/// @param {String} $mod - The modifier name.
@mixin bem-mod($mod) {
    $skip: false;
    $this: bem--selector-to-string(&);
    @if $this == '' {
        @error 'Detected a Modifier that is not inside a Block: ' + $mod;
    }
    @if (bem--contains-elem($this)) {
        @error 'Nesting a Modifier inside an Element (#{$this} #{$mod}) ' + 'is not supported. Instead, use bem-elem(myelem, elem-mod) syntax.';
    }
    @if (bem--contains-pseudo($this)) {
        @error 'Nesting a Modifier inside a pseudo-selector is not supported: #{$this} #{$mod}';
    }
    @at-root {
        #{bem-selector($this, $m: $mod)} {
            @content;
        }
    }
}

/// Unrolls into a block--modifier.[block--modifier...] .block__el
/// This mixin is useful when we want to apply classes to a block,
/// or block element when two or more modifiers are applied in tandem
/// @access public
/// @param {List} $mods - A list of modifiers
@mixin bem-mods($mods...) {
    $this: bem--selector-to-string(&);
    $mod-classes: ();
    @each $mod in $mods {
        @if $this == '' {
            @error 'Detected a Modifier that is not inside a Block: ' + $mod;
        }
        @if (bem--contains-elem($this)) {
            @error 'Nesting a Modifier inside an Element (#{$this} #{$mod}) ' + 'is not supported. Instead, use bem-elem(myelem, elem-mod) syntax.';
        }
        @if (bem--contains-pseudo($this)) {
            @error 'Nesting a Modifier inside a pseudo-selector is not supported: #{$this} #{$mod}';
        }
        $mod-classes: append(
            $mod-classes,
            #{bem-selector(
                    $block: $this,
                    $m: $mod
                )}
        );
    }
    @at-root {
        #{selector-append($mod-classes...)} {
            @content;
        }
    }
}

/// @alias bem-selector
@mixin bem($block, $e: null, $elem: null, $m: null, $mod: null, $mods: null) {
    #{bem-selector($block, $e: $e, $elem: $elem, $m: $m, $mod: $mod, $mods: $mods)} {
        @content;
    }
}

/// @alias bem-block
@mixin block($block) {
    @include bem-block($block) {
        @content;
    }
}

/// @alias bem-elem
@mixin elem($elem, $m: null, $mod: null, $mods: null) {
    @include bem-elem($elem, $m: $m, $mod: $mod, $mods: $mods) {
        @content;
    }
}

/// @alias bem-mod
@mixin mod($mod) {
    @include bem-mod($mod) {
        @content;
    }
}

/// @alias bem-mods
@mixin mods($mods...) {
    @include bem-mods($mods...) {
        @content;
    }
}

/// @alias bem-block
@mixin b($block) {
    @include bem-block($block) {
        @content;
    }
}

/// @alias bem-elem
@mixin e($elem, $m: null, $mod: null, $mods: null) {
    @include bem-elem($elem, $m: $m, $mod: $mod, $mods: $mods) {
        @content;
    }
}

/// @alias bem-mod
@mixin m($mod) {
    @include bem-mod($mod) {
        @content;
    }
}

/// @alias bem-mods
@mixin mx($mods...) {
    @include bem-mods($mods...) {
        @content;
    }
}

/// @group Breakpoints
/// @link  https://material.io/guidelines/layout/responsive-ui.html#responsive-ui-breakpoints
/// @link  https://material.angularjs.org/latest/layout/introduction
/// -> extra small
/// -> greater then extra small
/// -> less then small
/// -> small
/// -> greater then small
/// -> less then medium
/// -> medium
/// -> greater then medium
/// -> less then large
/// -> large
/// -> greater then large
/// -> less then extra large
/// -> extra large

// sass-lint:disable-block indentation
$breakpoint-map: (
    'xs': (
        'max-width': 599
    ),
    'gt-xs': (
        'min-width': 600
    ),
    'lt-sm': (
        'max-width': 959
    ),
    'sm': (
        'min-width': 600,
        'max-width': 959
    ),
    'gt-sm': (
        'min-width': 960
    ),
    'lt-md': (
        'max-width': 1279
    ),
    'md': (
        'min-width': 960,
        'max-width': 1279
    ),
    'gt-md': (
        'min-width': 1280
    ),
    'lt-lg': (
        'max-width': 1919
    ),
    'lg': (
        'min-width': 1280,
        'max-width': 1919
    ),
    'gt-lg': (
        'min-width': 1920
    ),
    'lt-xl': (
        'max-width': 1920
    ),
    'xl': (
        'min-width': 1920
    )
);

/// @group Breakpoints
/// @param {string} $key - A key of the $breakpoint-map
@mixin breakpoint-for($key) {
    @if map-has-key($breakpoint-map, $key) {
        @each $breakpoint-key, $breakpoints-value in $breakpoint-map {
            @if ($breakpoint-key == $key) {
                @if (map-has-key($breakpoints-value, 'min-width') and map-has-key($breakpoints-value, 'max-width')) {
                    @media (min-width: #{map-get($breakpoints-value, 'min-width') + 'px'}) and (max-width: #{map-get($breakpoints-value, 'max-width') + 'px'}) {
                        @content;
                    }
                } @else if(map-has-key($breakpoints-value, 'min-width') and not map-has-key($breakpoints-value, 'max-width')) {
                    @media (min-width: #{map-get($breakpoints-value, 'min-width') + 'px'}) {
                        @content;
                    }
                } @else if(map-has-key($breakpoints-value, 'max-width') and not map-has-key($breakpoints-value, 'min-width')) {
                    @media (max-width: #{map-get($breakpoints-value, 'max-width') + 'px'}) {
                        @content;
                    }
                }
            }
        }
    }
}

/// This lookup table is needed since there is no `pow` in SASS.
/// Pre-computed linear color channel values, for use in contrast calculations.
/// See https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
///
/// @example javascript - Algorithm, for c in 0 to 255:
/// f(c) {
///   c = c / 255;
///   return c < 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
/// }
///
/// @type List
$linear-channel-values: 0 0.0003035269835488375 0.000607053967097675 0.0009105809506465125 0.00121410793419535 0.0015176349177441874 0.001821161901293025 0.0021246888848418626 0.0024282158683907 0.0027317428519395373 0.003035269835488375 0.003346535763899161 0.003676507324047436 0.004024717018496307 0.004391442037410293 0.004776953480693729 0.005181516702338386 0.005605391624202723 0.006048833022857054 0.006512090792594475 0.006995410187265387 0.007499032043226175 0.008023192985384994 0.008568125618069307 0.009134058702220787 0.00972121732023785 0.010329823029626936 0.010960094006488246 0.011612245179743885 0.012286488356915872 0.012983032342173012 0.013702083047289686 0.014443843596092545 0.01520851442291271 0.01599629336550963 0.016807375752887384 0.017641954488384078 0.018500220128379697 0.019382360956935723 0.0202885630566524 0.021219010376003555 0.022173884793387385 0.02315336617811041 0.024157632448504756 0.02518685962736163 0.026241221894849898 0.027320891639074894 0.028426039504420793 0.0295568344378088 0.030713443732993635 0.03189603307301153 0.033104766570885055 0.03433980680868217 0.03560131487502034 0.03688945040110004 0.0382043715953465 0.03954623527673284
    0.04091519690685319 0.042311410620809675 0.043735029256973465 0.04518620438567554 0.046665086336880095 0.04817182422688942 0.04970656598412723 0.05126945837404324 0.052860647023180246 0.05448027644244237 0.05612849004960009 0.05780543019106723 0.0595112381629812 0.06124605423161761 0.06301001765316767 0.06480326669290577 0.06662593864377289 0.06847816984440017 0.07036009569659588 0.07227185068231748 0.07421356838014963 0.07618538148130785 0.07818742180518633 0.08021982031446832 0.0822827071298148 0.08437621154414882 0.08650046203654976 0.08865558628577294 0.09084171118340768 0.09305896284668745 0.0953074666309647 0.09758734714186246 0.09989872824711389 0.10224173308810132 0.10461648409110419 0.10702310297826761 0.10946171077829933 0.1119324278369056 0.11443537382697373 0.11697066775851084 0.11953842798834562 0.12213877222960187 0.12477181756095049 0.12743768043564743 0.1301364766903643 0.13286832155381798 0.13563332965520566 0.13843161503245183 0.14126329114027164 0.14412847085805777 0.14702726649759498 0.14995978981060856 0.15292615199615017 0.1559264637078274 0.1589608350608804 0.162029375639111 0.1651321945016676 0.16826940018969075 0.1714411007328226 0.17464740365558504
    0.17788841598362912 0.18116424424986022 0.184474994500441 0.18782077230067787 0.19120168274079138 0.1946178304415758 0.19806931955994886 0.20155625379439707 0.20507873639031693 0.20863687014525575 0.21223075741405523 0.21586050011389926 0.2195261997292692 0.2232279573168085 0.22696587351009836 0.23074004852434915 0.23455058216100522 0.238397573812271 0.24228112246555486 0.24620132670783548 0.25015828472995344 0.25415209433082675 0.2581828529215958 0.26225065752969623 0.26635560480286247 0.2704977910130658 0.27467731206038465 0.2788942634768104 0.2831487404299921 0.2874408377269175 0.29177064981753587 0.2961382707983211 0.3005437944157765 0.3049873140698863 0.30946892281750854 0.31398871337571754 0.31854677812509186 0.32314320911295075 0.3277780980565422 0.33245153634617935 0.33716361504833037 0.3419144249086609 0.3467040563550296 0.35153259950043936 0.3564001441459435 0.3613067797835095 0.3662525955988395 0.3712376804741491 0.3762621229909065 0.38132601143253014 0.386429433787049 0.39157247774972326 0.39675523072562685 0.4019777798321958 0.4072402119017367 0.41254261348390375 0.4178850708481375 0.4232676699860717 0.4286904966139066 0.43415363617474895 0.4396571738409188
    0.44520119451622786 0.45078578283822346 0.45641102318040466 0.4620769996544071 0.467783796112159 0.47353149614800955 0.4793201831008268 0.4851499400560704 0.4910208498478356 0.4969329950608704 0.5028864580325687 0.5088813208549338 0.5149176653765214 0.5209955732043543 0.5271151257058131 0.5332764040105052 0.5394794890121072 0.5457244613701866 0.5520114015120001 0.5583403896342679 0.5647115057049292 0.5711248294648731 0.5775804404296506 0.5840784178911641 0.5906188409193369 0.5972017883637634 0.6038273388553378 0.6104955708078648 0.6172065624196511 0.6239603916750761 0.6307571363461468 0.6375968739940326 0.6444796819705821 0.6514056374198242 0.6583748172794485 0.665387298282272 0.6724431569576875 0.6795424696330938 0.6866853124353135 0.6938717612919899 0.7011018919329731 0.7083757798916868 0.7156935005064807 0.7230551289219693 0.7304607400903537 0.7379104087727308 0.7454042095403874 0.7529422167760779 0.7605245046752924 0.768151147247507 0.7758222183174236 0.7835377915261935 0.7912979403326302 0.799102738014409 0.8069522576692516 0.8148465722161012 0.8227857543962835 0.8307698767746546 0.83879901174074 0.846873231509858 0.8549926081242338 0.8631572134541023 0.8713671191987972
    0.8796223968878317 0.8879231178819663 0.8962693533742664 0.9046611743911496 0.9130986517934192 0.9215818562772946 0.9301108583754237 0.938685728457888 0.9473065367331999 0.9559733532492861 0.9646862478944651 0.9734452903984125 0.9822505503331171 0.9911020971138298 1;
/// Calculates the luminance for a given color.
/// See https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests.
///
/// @param {Color} $color - The color to calculate luminance for.
@function luminance($color) {
    @if type-of($color) == 'color' {
        $red: nth($linear-channel-values, red($color) + 1);
        $green: nth($linear-channel-values, green($color) + 1);
        $blue: nth($linear-channel-values, blue($color) + 1);

        @return 0.2126 * $red + 0.7152 * $green + 0.0722 * $blue;
    }
    @return $color;
}

/// Calculates the contrast ratio between two colors.
/// See https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
///
/// @param {Color} $background - The background color.
/// @param {Color} $foreground - The foreground color.
/// @returns {Number} - The contrast ratio between the background and foreground colors.
@function contrast($background, $foreground) {
    $backLum: luminance($background) + 0.05;
    $foreLum: luminance($foreground) + 0.05;

    @return max($backLum, $foreLum) / min($backLum, $foreLum);
}

// Determine whether to use dark or light text on top of given color.
// Returns black for dark text and white for light text.
// @function colorset-style-contrast($color) {
//     $lightContrast: contrast($color, white);
//     $darkContrast: contrast($color, black);

//     @if ($lightContrast > $darkContrast) {
//         @return white;
//     } @else {
//         @return black;
//     }
// }

// sass-lint:disable zero-unit

/// Convert a number to a unit string
/// @param {Number} $value - Initial value
/// @param {String} $unit - Desired unit
/// @return {String}
/// @throw Error if `$value` are null or empty.
/// @throw Error if `$unit` are null or empty.
///
@function to-unit($value, $unit) {
    @if ($value and type-of($value) == number) {
        @if ($unit and type-of($unit) == string) {
            @return #{$value + $unit};
        } @else {
            @error 'Invalid unit for value: "`#{$value}`".';
        }
    } @else {
        @error 'Value "`#{$value}`" cannot parse to unit.';
    }
}

/// Convert one unit into another
/// @see https://www.sitepoint.com/understanding-sass-units/
/// @param {Number} $value - Initial value
/// @param {String} $unit - Desired unit
/// @return {Number}
/// @throw Error if `$unit` does not exist or if units are incompatible.
///
@function convert-unit($value, $unit) {
    $units: (
        'px': 0px,
        'cm': 0cm,
        'mm': 0mm,
        '%': 0%,
        'ch': 0ch,
        'in': 0in,
        'em': 0em,
        'rem': 0rem,
        'pt': 0pt,
        'pc': 0pc,
        'ex': 0ex,
        'vw': 0vw,
        'vh': 0vh,
        'vmin': 0vmin,
        'vmax': 0vmax,
        'deg': 0deg,
        'turn': 0turn,
        'rad': 0rad,
        'grad': 0grad,
        's': 0s,
        'ms': 0ms,
        'Hz': 0hz,
        'kHz': 0khz,
        'dppx': 0dppx,
        'dpcm': 0dpcm,
        'dpi': 0dpi
    );

    @if map-has-key($units, $unit) {
        @return map-get($units, $unit) + $value;
    }

    @error 'Unknown unit `#{$unit}`.';
}

/// TODO doc
/// @param {Array} $list - Initial value
/// @param {Number} $index - Desired unit
/// @return {Array}
/// @throw Error if `$index` is not a number.
/// @throw Error if `$index` is 0.
/// @throw Error if `$index` is greater then `$list` index.
///
@function remove-nth($list, $index) {
    $result: null;

    @if type-of($index) != number {
        @error '$index: #{quote($index)} is not a number for `remove-nth`.';
    } @else if $index == 0 {
        @error 'List index 0 must be a non-zero integer for `remove-nth`.';
    } @else if abs($index) > length($list) {
        @error 'List index is #{$index} but list is only #{length($list)} item long for `remove-nth`.';
    } @else {
        $result: ();
        $index: if($index < 0, length($list) + $index + 1, $index);

        @for $i from 1 through length($list) {
            @if $i != $index {
                $result: append($result, nth($list, $i));
            }
        }
    }

    @return $result;
}

/// Replace `$search` with `$replace` in `$string`
/// @param {String} $string - Initial string
/// @param {String} $search - Substring to replace
/// @param {String} $replace ('') - New value
/// @return {String} - Updated string
///
@function str-replace($string, $search, $replace: '') {
    $index: str-index($string, $search);

    @if $index {
        @return str-slice($string, 1, $index - 1) + $replace + str-replace(str-slice($string, $index + str-length($search)), $search, $replace);
    }

    @return $string;
}

/// Contains `$search` in `$string`
/// @access private
/// @param {String} $string - Initial string
/// @param {String} $search - String to search
/// @return {Boolean} - The result
///
@function str-contains($string, $search) {
    @return str-index($string, $search);
}

/// Slightly lighten a color
/// @access public
/// @group functions
/// @requires {function} is-color
/// @param {color} $color - color to tint
/// @param {number} $percentage - percentage of `$color` in returned color
/// @return {color}
///
@function tint($color, $percentage) {
    // @debug 'tinit color: #{$color}';
    @if is-color($color) {
        @return mix(white, $color, $percentage);
    }
    @error '$color #{$color} must be a color.';
}

/// Slightly darken a color
/// @access public
/// @group functions
/// @requires {function} is-color
/// @param {Color} $color - color to shade
/// @param {Number} $percentage - percentage of `$color` in returned color
/// @return {Color}
///
@function shade($color, $percentage) {
    // @debug 'tinit color: #{$color}';
    @if is-color($color) {
        @return mix(black, $color, $percentage);
    }
    @error '$color #{$color} must be a color.';
}

/// TODO doc
/// @access private
/// @param {Any} $value - The value
/// @return {Boolean}
///
@function empty($value) {
    @if not $value or $value == '' or $value == 0 or $value == () or length($value) == 0 {
        @return true;
    }
    @return false;
}

/// prefix properties ('webkit', 'moz', 'ms', 'o')
/// @group Mixins
/// @param {string[]} $prefixes - A prefix string array
/// @param {string} $property - A property name, combineable with a prefix
/// @param {any} $value - A property value
/// @param {boolean} $default [true] - Create default property withoutprefix
@mixin prefixed-properties($prefixes, $property, $value, $default: true) {
    @each $prefix in $prefixes {
        #{'-' + $prefix + '-' + $property}: #{$value};
    }

    @if $default == true {
        #{$property}: #{$value};
    }
}

/// Set mutiple properties value.
/// @group Mixins
/// @param {string[]} $properties [string[]] A property string array
/// @param {any} $value [null] - The property value
@mixin properties($properties: (), $value: null) {
    @each $property in $properties {
        #{$property}: $value;
    }
}

/// Prefix values with a given prefix.
/// @group Mixins
/// @param {any} $value
/// @param {string[]} $prefixes
/// @param {any} $default-value [null]
@mixin prefixed-values($value, $prefixes, $default-value: null) {
    @each $prefix in $prefixes {
        #{$value}: #{'-' + $prefix};
    }

    #{$value}: #{$default-value};
}

/// Set a property multiple times with the given values.
/// @group Mixins
/// @param {any} $value [null]
/// @param {any[]} $value [any[]]
@mixin values($property: null, $values: ()) {
    @each $value in $values {
        #{$property}: $value;
    }
}

/// Set a dir with the given ltr and rtl property.
/// @group Mixins
/// @param {string} $ltr-property
/// @param {string} $rtl-property
/// @param {any} $value
/// @param {any} $reset-value
@mixin rtl-prop($ltr-property, $rtl-property, $value, $reset-value) {
    #{$ltr-property}: $value;

    [dir='rtl'] & {
        #{$ltr-property}: $reset-value;
        #{$rtl-property}: $value;
    }
}

/// Create keyframes and webkit prefixed keyframes group
/// @group Mixins
/// @param {string} $name
@mixin animation-keyframe($name) {
    // sass-lint:disable-block no-vendor-prefixes
    @-webkit-keyframes #{$name} {
        @content;
    }

    @keyframes #{$name} {
        @content;
    }
}

/// set property value and fallback value
/// @group Mixins
/// @param {string} $property [string] The property
/// @param {any} $value [null] - The property value
/// @param {any} $fallbackValue [null] - The fallback property value
@mixin fallback($property, $value: null, $fallback-value: null) {
    #{$property}: $fallback-value;
    // sass-lint:disable-block no-duplicate-properties
    #{$property}: $value;
}

/// Combine a css :not selector.
/// @group Mixins
@mixin not($ignore-list...) {
    //if only a single value given
    @if (length($ignore-list) == 1) {
        //it is probably a list variable so set ignore list to the variable
        $ignore-list: nth($ignore-list, 1);
    }
    //set up an empty $notOutput variable
    $not-output: '';
    //for each item in the list
    @each $not in $ignore-list {
        //generate a :not([ignored_item]) segment for each item in the ignore list and put them back to back
        $not-output: $not-output + ':not(#{$not})';
    }
    //output the full :not() rule including all ignored items

    &#{$not-output} {
        @content;
    }
}

/// Pass in any number of transitions
/// @example @include transition(prop1, prop2, ..., 0.5s cubic-bezier(0.16, 0.85, 0.45, 1));
@mixin transition($args...) {
    $type: nth($args, length($args));
    $props: remove-nth($args, length($args));
    $result: ();

    @for $i from 1 through length($props) {
        $prop: nth($props, $i);
        $result: append($result, $prop);
        $result: append($result, $type);
        @if $i != length($props) {
            $result: append(
                $result,
                unquote(
                    $string: ','
                )
            );
        }
    }

    @include prefixed-properties(webkit, transition, $result, true);
}

/// Create selector based styles.
@mixin style($style-name, $selector, $prefix) {
    $legacy: nth($style-name, length($style-name));
    $name: remove-nth($style-name, length($style-name));

    @if $legacy == true {
        #{'#{$selector}'} {
            @content;
        }
    } @else {
        #{'#{$selector}[class^="#{$name}-#{$prefix}"]'} {
            &:not([class*='unstyled']) {
                @content;
            }
        }
    }
}

$_colorset-style-ctx: null !global;
/// Create the default color set style for
/// 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'contrast';
/// @group Style Mixins
@mixin colorset-style() {
    $colorset-list: 'primary' 'secondary' 'success' 'danger' 'warning' 'info' 'contrast';
    @each $current-color in $colorset-list {
        $old: $_colorset-style-ctx;
        $_colorset-style-ctx: var(--#{$current-color}-color) !global;

        &.#{$current-color} {
            @content;
        }

        $_colorset-style-ctx: $old !global;
    }
}

//#region Variables

/// Global light saturations
/// @group Palettes
/// @type Map
/// @prop {String}
/// @prop {Number}
///
$color-palette-light-saturations: (
    '50': 75,
    '100': 60,
    '200': 45,
    '300': 30,
    '400': 15
) !default;

/// Global main saturations
/// @group Palettes
/// @type Map
/// @prop {String}
/// @prop {Number}
///
$color-palette-main-saturations: (
    '500': 0
) !default;

/// Global dark saturations
/// @group Palettes
/// @type Map
/// @prop {String}
/// @prop {Number}
///
$color-palette-dark-saturations: (
    '600': 15,
    '700': 30,
    '800': 45,
    '900': 60
) !default;

/// Global opacities
/// @group Palettes
/// @type Map
/// @prop {String}
/// @prop {Number}
///
$color-palette-opacity-saturations: (
    'o15': 15,
    'o30': 30,
    'o45': 45,
    'o60': 60,
    'o75': 75
) !default;

$scheme-palette-shades: (
    '50': 0.02,
    '100': 0.04,
    '200': 0.08,
    '300': 0.12,
    '400': 0.26,
    '500': 0.38,
    '600': 0.54,
    '700': 0.62,
    '800': 0.74,
    '900': 0.87
) !default;

//#endregion

//#region Functions

/// Generates a color palette.
/// @access public
/// @group Palettes
/// @requires {function} generate-accent-palette
/// @requires {function} generate-scheme-palette
/// @requires {function} empty
/// @requires {function} is-color
/// @param {Color} $primary - The primary color used to generate the primary color palette.
/// @param {Color} $secondary - The secondary color used to generate the secondary color palette.
/// @param {Color} $info - The information color used throughout the application.
/// @param {Color} $success - The success color used throughout the application.
/// @param {Color} $warning - The warning color used throughout the application.
/// @param {Color} $error - The error color used throughout the application.
/// @param {Color} $gray - The color used for generating the grayscale palette.
/// @param {Color} $surface - The color used as a background in components, such as cards, sheets, and menus.
/// @return {Map} - A map consisting of 74 color variations, including the `primary`, `secondary`, `gray`, `info`, `success`, `warning`, and `error` colors.
///
@function palette($primary, $secondary, $info, $success, $warning, $danger, $gray, $surface) {
    $palettes: ();

    @if is-color($primary) {
        $primary-palette: generate-accent-palette('primary', $primary);
        $palettes: map-merge(
            $palettes,
            (
                primary: $primary-palette
            )
        );
    } @else {
        @error '$primary: #{$primary} is not a color.';
    }

    @if is-color($secondary) {
        $secondary-palette: generate-accent-palette('secondary', $secondary);
        $palettes: map-merge(
            $palettes,
            (
                secondary: $secondary-palette
            )
        );
    } @else {
        @error '$secondary: #{$secondary} is not a color.';
    }

    @if is-color($info) {
        $info-palette: generate-accent-palette('info', $info);
        $palettes: map-merge(
            $palettes,
            (
                info: $info-palette
            )
        );
    } @else {
        @error '$info: #{$info} is not a color.';
    }

    @if is-color($success) {
        $success-palette: generate-accent-palette('success', $success);
        $palettes: map-merge(
            $palettes,
            (
                success: $success-palette
            )
        );
    } @else {
        @error '$success: #{$success} is not a color.';
    }

    @if is-color($warning) {
        $warning-palette: generate-accent-palette('warning', $warning);
        $palettes: map-merge(
            $palettes,
            (
                warning: $warning-palette
            )
        );
    } @else {
        @error '$warning: #{$warning} is not a color.';
    }

    @if is-color($danger) {
        $danger-palette: generate-accent-palette('danger', $danger);
        $palettes: map-merge(
            $palettes,
            (
                danger: $danger-palette
            )
        );
    } @else {
        @error '$danger: #{$danger} is not a color.';
    }

    @if is-color($gray) {
        $gray-palette: generate-scheme-palette('gray', $gray);
        $palettes: map-merge(
            $palettes,
            (
                gray: $gray-palette
            )
        );
    } @else {
        @error '$gray: #{$gray} is not a color.';
    }

    @if is-color($surface) {
        $surface-palette: generate-scheme-palette('surface', $surface);
        $palettes: map-merge(
            $palettes,
            (
                surface: $surface-palette
            )
        );
    } @else {
        @error '$surface: #{$surface} is not a color.';
    }

    @return $palettes;
}

/// Retrieves a color from a color palette.
/// @access public
/// @group Palettes
/// @param {Map} $palette - The source palette map.
/// @param {string} $key - The target color from the color palette.
/// @param {string} $variant - The target color shade from the color palette.
/// @returns {Color} White if no palette, color, and variant matches found.
@function palette-color($palette, $key, $variant) {
    @if type-of($palette) == 'map' and map-has-key($palette, $key) {
        $variants: map-get($palette, $key);
        $result: map-get($variants, $variant);
        @if empty($result) {
            @error '$result: #{quote($result)} is empty.';
        }
        @return $result;
    }
    @return #ffffff;
}

/// Generate a accent palette from the given `$color`.
/// @access private
/// @group Palettes
/// @requires {function} tint
/// @requires {function} shade
/// @requires {function} empty
/// @param {String} $name - The color palette name.
/// @param {Color} $color - The color palette main color.
/// @param {Map} $alias-map - The alias color mapping. (this will be removed in the future)
/// @throw Error if `$color` is not a color.
///
@function generate-accent-palette($name, $color, $alias-map: (), $saturations: ('light': $color-palette-light-saturations, 'main': $color-palette-main-saturations, 'dark': $color-palette-dark-saturations, 'opacity': $color-palette-opacity-saturations)) {
    // @debug 'color-palette: #{$name}, #{$color}, #{$alias-map}';

    @if is-color($color) {
        $result: ();
        @each $key, $value in map-get($saturations, 'light') {
            $value: tint($color, $value);
            $result: map-merge(
                $result,
                (
                    $key: $value
                )
            );
        }

        @each $key, $value in map-get($saturations, 'main') {
            $value: $color;
            $result: map-merge(
                $result,
                (
                    $key: $value
                )
            );
        }

        @each $key, $value in map-get($saturations, 'dark') {
            $value: shade($color, $value);
            $result: map-merge(
                $result,
                (
                    $key: $value
                )
            );
        }

        @each $key, $value in map-get($saturations, 'opacity') {
            $value: transparentize($color, $value/100);
            $result: map-merge(
                $result,
                (
                    $key: $value
                )
            );
        }

        @each $key, $value in $alias-map {
            @if ($key == '') {
                $result: map-merge(
                    $result,
                    (
                        $name: $value
                    )
                );
            } @else {
                $result: map-merge(
                    $result,
                    (
                        $key: $value
                    )
                );
            }
        }

        @return $result;
    } @else {
        @error '$color: #{quote($color)} is not a color.';
    }
}

/// Generate a scheme palette from the given `$color`.
/// @access private
/// @group Palettes
/// @requires {function} empty
/// @param {String} $name - The color palette name.
/// @param {Color} $color - The color palette main color.
/// @param {Map} $alias-map - The alias color mapping. (this will be removed in the future)
/// @throw Error if `$color` is not a color.
///
@function generate-scheme-palette($name, $color, $alias-map: (), $shades: $scheme-palette-shades) {
    // @debug 'color-palette: #{$name}, #{$color}, #{$alias-map}';

    @if is-color($color) {
        $result: ();
        @each $saturation, $opacity in $shades {
            $shade: rgba(grayscale($color), $opacity);
            $result: map-merge(
                $result,
                (
                    $saturation: $shade
                )
            );
        }

        @each $key, $value in $alias-map {
            @if ($key == '') {
                $result: map-merge(
                    $result,
                    (
                        $name: $value
                    )
                );
            } @else {
                $result: map-merge(
                    $result,
                    (
                        $key: $value
                    )
                );
            }
        }
        @return $result;
    } @else {
        @error '$color: #{quote($color)} is not a color.';
    }
}

//#endregion

$radius-factor: 4 !default;
$thickness-factor: 2 !default;
$margin-factor: 8 !default;
$padding-factor: 8 !default;
$font-size-factor: 4 !default;
$line-height-factor: 4 !default;

$margin-loops: 12 !default;
$padding-loops: 12 !default;
$font-size-loops: 32 !default;
$line-height-loops: 32 !default;

$h1: 24px !default;
$h2: 20px !default;
$h3: 16px !default;
$h4: 16px !default;
$h5: 12px !default;
$h6: 12px !default;

$animation-duration: 300 !default;
$animation-fill-mode: 'forwards' !default;

$shadow-key-umbra-opacity: 0.2 !default;
$shadow-key-penumbra-opacity: 0.14 !default;
$shadow-ambient-shadow-opacity: 0.12 !default;
$box-shadow-1dp: 0 1px 3px 0 rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 1px 1px 0 rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 2px 1px -1px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-2dp: 0 1px 5px 0 rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 2px 2px 0 rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 3px 1px -2px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-3dp: 0 1px 8px 0 rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 3px 4px 0 rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 3px 3px -2px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-4dp: 0 2px 4px -1px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 4px 5px 0 rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 1px 10px 0 rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-5dp: 0 3px 5px -1px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 5px 8px 0 rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 1px 14px 0 rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-6dp: 0 3px 5px -1px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 6px 10px 0 rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 1px 18px 0 rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-7dp: 0 4px 5px -2px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 7px 10px 1px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 2px 16px 1px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-8dp: 0 5px 5px -3px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 8px 10px 1px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 3px 14px 2px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-9dp: 0 5px 6px -3px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 9px 12px 1px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 3px 16px 2px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-10dp: 0 6px 6px -3px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 10px 14px 1px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 4px 18px 3px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-11dp: 0 6px 7px -4px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 11px 15px 1px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 4px 20px 3px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-12dp: 0 7px 8px -4px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 12px 17px 2px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 5px 22px 4px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-13dp: 0 7px 8px -4px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 13px 19px 2px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 5px 24px 4px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-14dp: 0 7px 9px -4px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 14px 21px 2px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 5px 26px 4px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-15dp: 0 8px 9px -5px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 15px 22px 2px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 6px 28px 5px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-16dp: 0 8px 10px -5px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 16px 24px 2px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 6px 30px 5px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-17dp: 0 8px 11px -5px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 17px 26px 2px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 6px 32px 5px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-18dp: 0 9px 11px -5px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 18px 28px 2px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 7px 34px 6px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-19dp: 0 9px 12px -6px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 19px 29px 2px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 7px 36px 6px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-20dp: 0 10px 13px -6px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 20px 31px 3px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 8px 38px 7px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-21dp: 0 10px 13px -6px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 21px 33px 3px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 8px 40px 7px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-22dp: 0 10px 14px -6px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 22px 35px 3px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 8px 42px 7px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-23dp: 0 11px 14px -7px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 23px 36px 3px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 9px 44px 8px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
$box-shadow-24dp: 0 11px 15px -7px rgba(0, 0, 0, $shadow-key-umbra-opacity), 0 24px 38px 3px rgba(0, 0, 0, $shadow-key-penumbra-opacity), 0 9px 46px 8px rgba(0, 0, 0, $shadow-ambient-shadow-opacity) !default;
