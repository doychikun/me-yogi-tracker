import { Autocomplete, Box, TextField } from "@mui/material";
import { COUNTRIES, findCountry } from "../../common/phone";

// Country code picker (searchable, e.g. "Bulgaria +359") next to the number.
const PhoneField = ({
  country,
  national,
  onCountryChange,
  onNationalChange,
  onBlur,
  error,
  helperText,
  label = "Phone number",
  required = false,
  inputRef,
  name,
}) => {
  const selected = findCountry(country);

  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <Autocomplete
        options={COUNTRIES}
        value={selected}
        disableClearable
        autoHighlight
        onChange={(_, option) => option && onCountryChange(option.iso)}
        getOptionLabel={(option) => option.dialCode}
        isOptionEqualToValue={(option, value) => option.iso === value.iso}
        filterOptions={(options, { inputValue }) => {
          const query = inputValue.trim().toLowerCase().replace(/^\+/, "");
          if (!query || query === selected.dialCode.slice(1)) return options;
          return options.filter(
            (option) =>
              option.name.toLowerCase().includes(query) ||
              option.iso.toLowerCase() === query ||
              option.dialCode.slice(1).startsWith(query)
          );
        }}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.iso} sx={{ gap: 1 }}>
            <Box component="span" sx={{ flexGrow: 1 }}>
              {option.name}
            </Box>
            <Box component="span" sx={{ color: "#9494B6", fontWeight: 600 }}>
              {option.dialCode}
            </Box>
          </Box>
        )}
        componentsProps={{ paper: { sx: { minWidth: 280 } } }}
        sx={{ width: 128, flexShrink: 0 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Code"
            inputProps={{ ...params.inputProps, "aria-label": "Country code" }}
            helperText={selected.name}
            FormHelperTextProps={{ sx: { mx: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }}
          />
        )}
      />
      <TextField
        label={label}
        name={name}
        type="tel"
        autoComplete="tel-national"
        required={required}
        fullWidth
        value={national}
        onChange={(e) => onNationalChange(e.target.value)}
        onBlur={onBlur}
        inputRef={inputRef}
        error={!!error}
        helperText={error || helperText || " "}
        placeholder="888 123 456"
      />
    </Box>
  );
};

export default PhoneField;
