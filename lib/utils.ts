export const formatServiceTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);

    if (h < 12) return 'CULTO MANHÃ';
    return 'CULTO NOITE';
};

export const getCampusColor = (name: string) => {
    const lower = name.toLowerCase();

    if (lower.includes('centro')) return 'text-pop-yellow'; // Amarelo
    if (lower.includes('cambé') || lower.includes('cambe')) return 'text-cta'; // Verde
    if (lower.includes('ibiporã') || lower.includes('ibipora')) return 'text-pop-pink'; // Rosa (User correction)
    if (lower.includes('zona sul')) return 'text-pop-purple'; // Roxo

    // Correction based on user request:
    // Centro = Amarelo -> text-pop-yellow
    // Cambé = Verde -> text-cta (Green)
    // Ibiporã = Lilás -> Let's add a Lilac class or use Purple light. Tailwind purple-400 is lilac-ish.
    // Zona Sul = Roxo -> text-pop-purple (Purple-500)

    return 'text-primary';
};

export const getCampusColorBg = (name: string) => {
    const lower = name.toLowerCase();

    // Returning Border/BG accent classes
    if (lower.includes('centro')) return 'bg-pop-yellow';
    if (lower.includes('cambé') || lower.includes('cambe')) return 'bg-cta';
    if (lower.includes('ibiporã') || lower.includes('ibipora')) return 'bg-pop-pink'; // Rosa
    if (lower.includes('zona sul')) return 'bg-pop-purple'; // Roxo

    return 'bg-primary';
};
