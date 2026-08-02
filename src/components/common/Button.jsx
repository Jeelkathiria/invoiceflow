import clsx from 'clsx';

function Button({ children, variant = 'primary', className = '', as: Component = 'button', ...props }) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 shadow-sm',
    ghost: 'bg-transparent text-slate-700 hover:text-brand-600',
  };

  return (
    <Component
      className={clsx(
        'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
