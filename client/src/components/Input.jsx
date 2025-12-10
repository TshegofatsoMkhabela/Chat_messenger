const Input = ({ icon: Icon, ...props }) => {
    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon className="size-5 text-purple-600" />
            </div>
            <input
                {...props}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600 text-gray-900 placeholder-gray-400 transition duration-200 focus:outline-none"
            />
        </div>
    );
};
export default Input;
