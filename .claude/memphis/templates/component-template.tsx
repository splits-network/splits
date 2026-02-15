/**
 * Memphis Component Template
 *
 * Use this template for creating new Memphis-compliant components.
 * All components must follow Memphis design principles.
 */

export interface ComponentNameProps {
  /** Component title */
  title: string;
  /** Component content */
  content?: string;
  /** Memphis accent color */
  accentColor?: 'coral' | 'teal' | 'yellow' | 'purple';
  /** Optional click handler */
  onClick?: () => void;
  /** Optional className override */
  className?: string;
}

/**
 * ComponentName - Brief description
 *
 * Memphis design compliance:
 * - Flat design (no shadows)
 * - Sharp corners (border-radius: 0)
 * - 4px borders
 * - Memphis colors only
 * - Geometric decorations
 *
 * @example
 * ```tsx
 * <ComponentName
 *   title="Example Title"
 *   content="Example content"
 *   accentColor="coral"
 * />
 * ```
 */
export function ComponentName({
  title,
  content,
  accentColor = 'coral',
  onClick,
  className = '',
}: ComponentNameProps) {
  return (
    <div
      className={`card border-4 border-dark bg-cream p-6 relative ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Geometric Decoration */}
      <div className={`absolute top-4 right-4 w-8 h-8 bg-${accentColor} rotate-45`} />

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold uppercase text-dark mb-4">
          {title}
        </h3>

        {content && (
          <p className="text-dark opacity-70">
            {content}
          </p>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 w-full h-2 bg-${accentColor}`} />
    </div>
  );
}

// Additional component variants
export function ComponentNameCompact({
  title,
  accentColor = 'teal',
}: Pick<ComponentNameProps, 'title' | 'accentColor'>) {
  return (
    <div className={`flex items-center gap-3 border-l-4 border-${accentColor} bg-cream p-4`}>
      <div className={`w-8 h-8 bg-${accentColor} flex items-center justify-center`}>
        <i className="fa-regular fa-star text-dark"></i>
      </div>
      <span className="font-bold text-dark">{title}</span>
    </div>
  );
}

export function ComponentNameWithIcon({
  title,
  content,
  icon,
  accentColor = 'coral',
}: ComponentNameProps & { icon: string }) {
  return (
    <div className="card border-4 border-dark bg-cream p-6 relative">
      {/* Icon section */}
      <div className={`w-16 h-16 bg-${accentColor} flex items-center justify-center mb-4`}>
        <i className={`fa-regular ${icon} text-dark text-2xl`}></i>
      </div>

      <h3 className="text-xl font-bold uppercase text-dark mb-3">
        {title}
      </h3>

      {content && (
        <p className="text-dark opacity-70">
          {content}
        </p>
      )}

      {/* Geometric decoration */}
      <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-yellow" />
    </div>
  );
}

// Memphis Button Variants
export function MemphisButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-coral text-dark hover:bg-teal',
    secondary: 'bg-teal text-dark hover:bg-coral',
    ghost: 'bg-transparent text-dark hover:bg-cream',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        border-4 border-dark
        font-bold uppercase tracking-wider
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// Memphis Input Component
export function MemphisInput({
  placeholder,
  value,
  onChange,
  type = 'text',
  error = false,
  className = '',
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: boolean;
  className?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        input w-full
        border-4 ${error ? 'border-coral' : 'border-dark'}
        bg-cream text-dark
        placeholder-dark placeholder-opacity-50
        font-medium
        focus:border-${error ? 'coral' : 'teal'}
        focus:outline-none
        ${className}
      `}
    />
  );
}

// Memphis Badge Component
export function MemphisBadge({
  children,
  color = 'purple',
  size = 'md',
}: {
  children: React.ReactNode;
  color?: 'coral' | 'teal' | 'yellow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <span
      className={`
        inline-block
        bg-${color}
        text-dark
        border-2 border-dark
        font-bold uppercase
        ${sizeClasses[size]}
      `}
    >
      {children}
    </span>
  );
}
